import { Part } from '../entity/part.entity';
import { Test } from '../entity/test.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Test)
export class TestRepository extends EntityRepository<Test> {
  async findById({ id }): Promise<Test | undefined> {
    return this.findOne({ id });
  }

  async findByIdWithPart(id: string): Promise<Test | undefined> {
    return this.findOne({ id });
  }

  async findByTitleAndPartId(
    title: string,
    part: Part,
  ): Promise<Test | undefined> {
    return this.findOne({ title, part });
  }
}
