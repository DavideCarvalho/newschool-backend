import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from '../repository/course.repository';
import { CourseMapper } from '../mapper/course.mapper';
import { CourseDTO } from '../dto/course.dto';
import { UserService } from '../../UserModule/service/user.service';
import { CourseUpdateDTO } from '../dto/course-update.dto';
import { NewCourseDTO } from '../dto/new-course.dto';
import { Course } from '../entity/course.entity';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly repository: CourseRepository,
    private readonly mapper: CourseMapper,
    private readonly userService: UserService,
  ) {}

  public async add(newCourse: NewCourseDTO, file): Promise<Course> {
    const course = this.mapper.toEntity(newCourse);
    course.photoName = file.filename;
    try {
      const createdCourse = await this.repository.create(course);
      await this.repository.persistAndFlush(createdCourse);
      return createdCourse;
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Course with same title already exists');
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  public async findByAuthorName(authorName: string): Promise<Course[]> {
    const courses: Course[] = await this.repository.findByAuthorName(
      authorName,
    );
    if (!courses.length) {
      throw new NotFoundException('No courses found for this author');
    }
    return courses;
  }

  public async update(
    id: Course['id'],
    userUpdatedInfo: CourseUpdateDTO,
  ): Promise<Course> {
    const course: Course = await this.findById(id);
    const updatedCourse = await this.repository.create(
      this.mapper.toEntity(({
        ...course,
        ...userUpdatedInfo,
      } as unknown) as CourseDTO),
    );
    await this.repository.persistAndFlush(updatedCourse);
    return updatedCourse;
  }

  public async getAll(enabled?: boolean): Promise<Course[]> {
    if (enabled == null) return this.repository.findAll();
    return this.repository.find({ enabled: enabled });
  }

  public async findById(id: Course['id']): Promise<Course> {
    const course: Course = await this.repository.findOne(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  public async findBySlug(slug: string): Promise<Course> {
    const course: Course = await this.repository.findBySlug(slug);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  public async delete(id: Course['id']): Promise<void> {
    const course: Course = await this.findById(id);
    const removedCourse = await this.repository.create({
      ...course,
      enabled: false,
    });
    await this.repository.persistAndFlush(removedCourse);
  }

  public async findByTitle(title: string): Promise<Course> {
    const course = await this.repository.findByTitle(title);
    if (!course) {
      throw new NotFoundException();
    }
    return course;
  }
}
