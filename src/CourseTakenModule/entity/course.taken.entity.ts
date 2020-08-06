import { Expose } from 'class-transformer';
import { CourseTakenStatusEnum } from '../enum/enum';
import { User } from '../../UserModule/entity/user.entity';
import { Part } from '../../CourseModule/entity/part.entity';
import { Course } from '../../CourseModule/entity/course.entity';
import { Lesson } from '../../CourseModule/entity/lesson.entity';
import { Test } from '../../CourseModule/entity/test.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';
import { Entity, ManyToOne, Property } from 'mikro-orm';

@Entity()
export class CourseTaken extends Audit {
  @ManyToOne<User>({
    entity: 'User',
    inversedBy: (user: User) => user.coursesTaken,
    primary: true,
  })
  @Expose()
  user: User;

  @ManyToOne<Course>({
    entity: 'Course',
    inversedBy: (course: Course) => course.takenCourses,
    primary: true,
  })
  @Expose()
  course: Course;

  @Property({
    nullable: false,
    name: 'course_start_date',
  })
  @Expose()
  courseStartDate: Date;

  @Property({
    nullable: true,
    name: 'course_complete_date',
  })
  @Expose()
  courseCompleteDate: Date;

  @Property({
    nullable: false,
    name: 'status',
    type: 'enum',
    default: CourseTakenStatusEnum.TAKEN,
  })
  @Expose()
  status: CourseTakenStatusEnum;

  @Property({
    nullable: false,
    name: 'completion',
    default: 0,
  })
  @Expose()
  completion: number;

  @ManyToOne<Lesson>({
    entity: 'Lesson',
    inversedBy: (lesson: Lesson) => lesson.currentCoursesTaken,
    nullable: true,
  })
  @Expose()
  currentLesson: Lesson;

  @ManyToOne<Part>({
    entity: 'Part',
    inversedBy: (part: Part) => part.currentCoursesTaken,
    nullable: true,
  })
  @Expose()
  currentPart: Part;

  @ManyToOne<Test>({
    entity: 'Test',
    inversedBy: (test: Test) => test.currentCoursesTaken,
    nullable: true,
  })
  @Expose()
  currentTest: Test;
}
