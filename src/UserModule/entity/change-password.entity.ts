import { User } from './user.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Entity, ManyToOne, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export class ChangePassword extends Audit {
  @PrimaryKey()
  id: string = v4();

  @Property()
  expirationTime: number;

  @ManyToOne<User>({
    entity: 'User',
    inversedBy: (user: User) => user.changePasswordRequests,
  })
  user: User;
}
