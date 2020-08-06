import { Lesson } from './lesson.entity';
import { Test } from './test.entity';
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

@Unique({ properties: ['sequenceNumber', 'lesson'] })
@Entity()
export class Part extends Audit {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property({
    name: 'title',
  })
  @Expose()
  title: string;

  @Property({
    name: 'description',
  })
  @Expose()
  description: string;

  @Property({
    nullable: true,
    name: 'vimeo_url',
  })
  @Expose()
  vimeoUrl?: string;

  @Property({
    nullable: true,
    name: 'youtube_url',
  })
  @Expose()
  youtubeUrl?: string;

  @ManyToOne<Lesson>({
    entity: 'Lesson',
    inversedBy: (lesson: Lesson) => lesson.parts,
  })
  @Expose()
  lesson: Lesson;

  @Property({
    name: 'seq_num',
  })
  @Expose()
  sequenceNumber: number;

  @OneToMany<Test>('Test', (test: Test) => test.part)
  tests: Test[];

  @OneToMany<CourseTaken>(
    'CourseTaken',
    (courseTaken: CourseTaken) => courseTaken.currentPart,
  )
  currentCoursesTaken: CourseTaken[];
}
