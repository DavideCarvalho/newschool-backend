import { Part } from '../entity/part.entity';
import { Lesson } from '../entity/lesson.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Part)
export class PartRepository extends EntityRepository<Part> {
  async findById(id: string): Promise<Part | undefined> {
    return this.findOne({ id });
  }

  async findByTitleAndLesson(
    title: string,
    lesson: Lesson,
  ): Promise<Part | undefined> {
    return this.findOne({ title, lesson });
  }

  async findByIdWithLesson(id: string): Promise<Part | undefined> {
    return this.findOne({ id });
  }
}
