import * as crypto from 'crypto';
import { Role } from '../../SecurityModule/entity/role.entity';
import { ChangePassword } from './change-password.entity';
import { Expose } from 'class-transformer';
import { CourseTaken } from '../../CourseTakenModule/entity/course.taken.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Certificate } from '../../CertificateModule/entity/certificate.entity';
import { GenderEnum } from '../enum/gender.enum';
import { EscolarityEnum } from '../enum/escolarity.enum';
import {
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export class User extends Audit {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property({
    nullable: false,
  })
  @Expose()
  name: string;

  @Property({ unique: true })
  @Expose()
  email: string;

  @Property()
  @Expose()
  password: string;

  @Property({ nullable: false })
  @Expose()
  nickname: string;

  @Property({ nullable: false })
  @Expose()
  birthday: Date;

  @Property({ type: 'enum', nullable: false })
  @Expose()
  gender: GenderEnum;

  @Property({ type: 'enum', nullable: false })
  @Expose()
  schooling: EscolarityEnum;

  @Property({ nullable: false })
  @Expose()
  institutionName: string;

  @Property({ nullable: false })
  @Expose()
  profession: string;

  @Property({ nullable: false })
  @Expose()
  address: string;

  @Property({ name: 'url_facebook', nullable: true })
  @Expose()
  urlFacebook?: string;

  @Property({ name: 'url_instagram', nullable: true })
  @Expose()
  urlInstagram?: string;

  @Property({
    default: '',
  })
  @Expose()
  salt: string;

  @Property({ name: 'facebook_id', nullable: true })
  @Expose()
  facebookId?: string;

  @Property({ name: 'google_sub', nullable: true })
  @Expose()
  googleSub?: string;

  @ManyToOne({
    entity: 'Role',
    inversedBy: (role: Role) => role.users,
  })
  @Expose()
  role: Role;

  @OneToMany<ChangePassword>(
    'ChangePassword',
    (changePassword: ChangePassword) => changePassword.user,
  )
  @Expose()
  changePasswordRequests: ChangePassword[];

  @ManyToMany('Certificate')
  @Expose()
  certificates: Certificate[];

  @OneToMany<CourseTaken>(
    'CourseTaken',
    (courseTaken: CourseTaken) => courseTaken.user,
  )
  coursesTaken: CourseTaken[];

  validPassword(password: string) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
      .toString(`hex`);
    return this.password === hash;
  }
}
