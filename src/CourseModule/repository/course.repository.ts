import { Course } from '../entity/course.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Course)
export class CourseRepository extends EntityRepository<Course> {
  async findByTitle(title: string): Promise<Course | undefined> {
    return this.findOne({ title });
  }

  async findById(id: string): Promise<Course | undefined> {
    return this.findOne({ id });
  }

  async findBySlug(slug: string): Promise<Course | undefined> {
    return this.findOne({ slug });
  }

  async findByAuthorName(authorName: string): Promise<Course[]> {
    return this.find({ authorName });
  }
}
