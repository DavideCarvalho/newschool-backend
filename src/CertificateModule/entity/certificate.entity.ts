import { Entity, ManyToMany, PrimaryKey, Property } from 'mikro-orm';
import { Expose } from 'class-transformer';
import { User } from '../../UserModule/entity/user.entity';
import { v4 } from 'uuid';

@Entity()
export class Certificate {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property()
  @Expose()
  title: string;

  @Property()
  @Expose()
  text: string;

  // field created to have in assets different images being passed for each course created
  @Property()
  @Expose()
  certificateBackgroundName: string;

  @ManyToMany(
    () => User,
    (user: User) => user.certificates,
  )
  @Expose()
  users: User[];
}
