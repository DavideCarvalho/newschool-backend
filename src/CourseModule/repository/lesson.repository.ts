import { Course } from '../entity/course.entity';
import { Lesson } from '../entity/lesson.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Lesson)
export class LessonRepository extends EntityRepository<Lesson> {
  async findById(id: string): Promise<Lesson | undefined> {
    return this.findOne({ id });
  }

  async findByIdWithCourse(id: string): Promise<Lesson | undefined> {
    return this.findOne({ id });
  }

  async findByTitleAndCourse(
    title: string,
    course: Course,
  ): Promise<Lesson | undefined> {
    return this.findOne({ title, course });
  }
}
