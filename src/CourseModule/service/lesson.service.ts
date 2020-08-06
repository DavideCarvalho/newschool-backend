import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { LessonRepository } from '../repository/lesson.repository';
import { LessonUpdateDTO } from '../dto/lesson-update.dto';
import { NewLessonDTO } from '../dto/new-lesson.dto';
import { Course } from '../entity/course.entity';
import { Lesson } from '../entity/lesson.entity';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class LessonService {
  constructor(
    private readonly courseService: CourseService,
    @InjectRepository(Lesson)
    private readonly repository: LessonRepository,
  ) {}

  public async add(lesson: NewLessonDTO): Promise<Lesson> {
    const course: Course = await this.courseService.findById(lesson.courseId);
    const lessonSameTitle: Lesson = await this.repository.findByTitleAndCourse(
      lesson.title,
      course,
    );

    if (lessonSameTitle) {
      throw new ConflictException(
        'There is already a lesson with this title for this course',
      );
    }

    const createdLesson = await this.repository.create({
      ...lesson,
      course,
      sequenceNumber: 1 + (await this.repository.count({ course })),
    });
    await this.repository.persistAndFlush(createdLesson);
    return createdLesson;
  }

  public async update(
    id: Lesson['id'],
    lessonUpdatedInfo: LessonUpdateDTO,
  ): Promise<Lesson> {
    const lesson: Lesson = await this.repository.findByIdWithCourse(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const course =
      lessonUpdatedInfo.courseId === lesson.course.id
        ? lesson.course
        : await this.courseService.findById(lessonUpdatedInfo.courseId);
    const createdLesson = this.repository.create({
      ...lesson,
      ...lessonUpdatedInfo,
      course,
    });
    await this.repository.persistAndFlush(createdLesson);
    return createdLesson;
  }

  public async getAll(courseId: Course['id']): Promise<Lesson[]> {
    return this.repository.find({
      course: await this.courseService.findById(courseId),
    });
  }

  public async findById(id: Lesson['id']): Promise<Lesson> {
    const lesson: Lesson = await this.repository.findOne({ id });
    if (!lesson) {
      throw new NotFoundException();
    }
    return lesson;
  }

  public async delete(id: Lesson['id']): Promise<void> {
    const deletedLesson: Lesson = await this.repository.findOne({ id });
    const lessonQuantity: number = await this.repository.count({
      course: deletedLesson.course,
    });
    await this.repository.remove({ id });
    await this.repository.flush();
    if (deletedLesson.sequenceNumber === lessonQuantity) {
      return;
    }

    // const lessons: Lesson[] = await this.repository.find({
    //   where: {
    //     sequenceNumber: MoreThan(deletedLesson),
    //   },
    //   order: {
    //     sequenceNumber: 'ASC',
    //   },
    // });

    const lessons: Lesson[] = await this.repository.find(
      {
        sequenceNumber: {
          $gt: deletedLesson.sequenceNumber,
        },
      },
      {
        orderBy: {
          sequenceNumber: 'ASC',
        },
      },
    );
    for (const lesson of lessons) {
      const updatedLesson = await this.repository.create({
        ...lesson,
        sequenceNumber: lesson.sequenceNumber - 1,
      });
      await this.repository.persistAndFlush(updatedLesson);
    }
  }

  public async countByCourse(course: Course): Promise<number> {
    return await this.repository.count({ course });
  }

  public async getByCourseAndSequenceNumber(
    course: Course,
    sequenceNumber: number,
  ): Promise<Lesson> {
    return await this.repository.findOne({ course, sequenceNumber });
  }
}
