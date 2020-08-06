import { Templates } from '../entity/templates.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Templates)
export class TemplateRepository extends EntityRepository<Templates> {
  public async findById(id: string): Promise<Templates> {
    return this.findById(id);
  }

  public async findByName(name: string): Promise<Templates> {
    return this.findOne({ name });
  }
}
