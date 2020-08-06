import { ClientCredentialsEnum } from '../enum/client-credentials.enum';
import { Role } from './role.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Entity, ManyToOne, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity({ tableName: 'client-credentials' })
export class ClientCredentials extends Audit {
  @PrimaryKey()
  id: string = v4();

  @Property({
    type: 'enum',
    nullable: false,
    unique: true,
  })
  name: ClientCredentialsEnum;

  @Property({ type: 'varchar' })
  secret: string;

  @ManyToOne<Role>({
    entity: 'Role',
    inversedBy: (role: Role) => role.clientCredentials,
  })
  role: Role;
}
