import { ChangePassword } from '../entity/change-password.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(ChangePassword)
export class ChangePasswordRepository extends EntityRepository<
  ChangePassword
> {}
