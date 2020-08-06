import { RoleEnum } from '../enum/role.enum';
import { ClientCredentials } from './client-credentials.entity';
import { User } from '../../UserModule/entity/user.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Collection, Entity, OneToMany, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export class Role extends Audit {
  @PrimaryKey()
  id: string = v4();

  @Property({
    type: 'enum',
    nullable: false,
    unique: true,
  })
  name: RoleEnum;

  @OneToMany<ClientCredentials>(
    () => ClientCredentials,
    (clientCredentials: ClientCredentials) => clientCredentials.role,
  )
  clientCredentials: Collection<ClientCredentials> = new Collection<
    ClientCredentials
  >(this);

  @OneToMany<User>(
    () => User,
    (user: User) => user.role,
  )
  users: Collection<User> = new Collection<User>(this);
}
