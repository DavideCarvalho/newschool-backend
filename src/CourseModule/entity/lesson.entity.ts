import { Course } from './course.entity';
import { Part } from './part.entity';
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

@Unique({ properties: ['sequenceNumber', 'course'] })
@Entity()
export class Lesson extends Audit {
  @PrimaryKey()
  id: string = v4();

  @Property({
    name: 'title',
  })
  title: string;

  @Property({
    name: 'description',
  })
  description: string;

  @Property({
    name: 'seq_num',
  })
  sequenceNumber: number;

  @ManyToOne<Course>({
    entity: 'Course',
    inversedBy: (course: Course) => course.lessons,
  })
  course: Course;

  @OneToMany<Part>('Part', (part: Part) => part.lesson)
  parts: Part[];

  @OneToMany<CourseTaken>(
    'CourseTaken',
    (courseTaken: CourseTaken) => courseTaken.currentLesson,
  )
  currentCoursesTaken: CourseTaken[];
}
