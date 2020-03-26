import { EntityRepository, Repository } from 'typeorm';
import { CourseTakenStatusEnum } from '../enum/enum';
import { User } from '../../UserModule/entity/user.entity';
import { CourseTaken } from '../entity/course.taken.entity';
import { CertificateDTO } from '../dto/certificate.dto';

@EntityRepository(CourseTaken)
export class CourseTakenRepository extends Repository<CourseTaken> {
  public async findByUserId(
    user: CourseTaken['user'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ relations: ['user', 'course'], where: { user: user } });
  }

  public async findByUser(
    user: CourseTaken['user'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ relations: ['user', 'course'], where: { user } });
  }

  public async findByUserAndCourseWithAllRelations(
    user: CourseTaken['user'],
    course: CourseTaken['course'],
  ) {
    return this.findOne(
      { user, course },
      {
        relations: [
          'user',
          'course',
          'currentLesson',
          'currentPart',
          'currentTest',
        ],
      },
    );
  }

  public async findCertificateByUserAndCourse(
    user: CourseTaken['user'],
    course: CourseTaken['course'],
  ): Promise<CertificateDTO> {
    return this.findOne(
      { user, course, status: CourseTakenStatusEnum.COMPLETED },
      { relations: ['user', 'course'] },
    );
  }

  public async findCertificatesByUserId(
    user: User['id'],
  ): Promise<CertificateDTO[]> {
    return this.find({
      relations: ['user', 'course'],
      where: { user: user, status: CourseTakenStatusEnum.COMPLETED },
    });
  }

  public async findByCourseId(
    course: CourseTaken['course'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ course });
  }

  public async findByCourse(
    course: CourseTaken['course'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ course });
  }

  public async findByUserIdAndCourseId(
    user: CourseTaken['user'],
    course: CourseTaken['course'],
  ): Promise<CourseTaken | undefined> {
    return this.findOne({ user, course }, { relations: ['user', 'course'] });
  }
}
