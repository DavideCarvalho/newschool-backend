import { Role } from '../entity/role.entity';
import { RoleEnum } from '../enum/role.enum';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Role)
export class RoleRepository extends EntityRepository<Role> {
  public async findByRoleName(name: RoleEnum): Promise<Role> {
    return this.findOne({ name });
  }
}
