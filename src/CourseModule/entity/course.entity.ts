import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Lesson } from './lesson.entity';
import { Expose } from 'class-transformer';
import slugify from 'slugify';
import { CourseTaken } from '../../CourseTakenModule/entity/course.taken.entity';
import { Entity, OneToMany, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export class Course extends Audit {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property({
    unique: true,
  })
  @Expose()
  title: string;

  @Property()
  @Expose()
  description: string;

  @Property()
  @Expose()
  authorName: string;

  @Property()
  @Expose()
  authorDescription: string;

  @Property({
    type: 'int',
  })
  @Expose()
  workload: number;

  @Property({
    nullable: true,
  })
  @Expose()
  thumbUrl?: string;

  @Property({
    type: 'boolean',
    default: true,
  })
  @Expose()
  enabled: boolean;

  @Property()
  photoName: string;

  @OneToMany<Lesson>('Lesson', (lesson: Lesson) => lesson.course)
  lessons: Lesson[];

  @OneToMany<CourseTaken>(
    'CourseTaken',
    (takenCourses: CourseTaken) => takenCourses.course,
  )
  takenCourses: CourseTaken[];

  @Property()
  @Expose()
  get slug(): string {
    return slugify(this.title, { replacement: '-', lower: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set slug(slug: string) {}
}
