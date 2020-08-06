import { Part } from './part.entity';
import { Expose } from 'class-transformer';
import { CourseTaken } from '../../CourseTakenModule/entity/course.taken.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from 'mikro-orm';
import { v4 } from 'uuid';

@Unique({ properties: ['sequenceNumber', 'part'] })
@Entity()
export class Test extends Audit {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property({
    name: 'title',
  })
  @Expose()
  title: string;

  @Property({
    nullable: true,
    name: 'question',
  })
  @Expose()
  question?: string;

  @Property({
    name: 'correct_alternative',
  })
  @Expose()
  correctAlternative: string;

  @Property({
    name: 'first_alternative',
  })
  @Expose()
  firstAlternative: string;

  @Property({
    name: 'second_alternative',
  })
  @Expose()
  secondAlternative: string;

  @Property({
    name: 'third_alternative',
  })
  @Expose()
  thirdAlternative: string;

  @Property({
    name: 'fourth_alternative',
  })
  @Expose()
  fourthAlternative: string;

  @Property({
    nullable: false,
    name: 'seq_num',
  })
  sequenceNumber: number;

  @ManyToOne<Part>({
    entity: 'Part',
    inversedBy: (part: Part) => part.tests,
  })
  @Expose()
  part: Part;

  @OneToMany<CourseTaken>(
    'CourseTaken',
    (courseTaken: CourseTaken) => courseTaken.currentTest,
  )
  currentCoursesTaken: CourseTaken[];
}
