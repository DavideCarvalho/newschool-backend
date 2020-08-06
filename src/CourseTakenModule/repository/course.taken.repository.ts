import { CourseTakenStatusEnum } from '../enum/enum';
import { User } from '../../UserModule/entity/user.entity';
import { CourseTaken } from '../entity/course.taken.entity';
import { CertificateDTO } from '../dto/certificate.dto';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(CourseTaken)
export class CourseTakenRepository extends EntityRepository<CourseTaken> {
  public async findByUserId(
    user: CourseTaken['user'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ user: user });
  }

  public async findByUser(
    user: CourseTaken['user'],
  ): Promise<CourseTaken[] | undefined> {
    return this.find({ user });
  }

  public async getActiveUsersQuantity(): Promise<number> {
    // eslint-disable-next-line camelcase
    const activeUsers: { user_id: number }[] = await this.createQueryBuilder(
      'coursetaken',
    )
      .where('coursetaken.completion >= ?', [30])
      .select('coursetaken.user', true)
      .orderBy({ user: 'ASC' })
      .execute();
    return activeUsers.length;
  }

  public async getCertificateQuantity(): Promise<number> {
    return this.count({ status: CourseTakenStatusEnum.COMPLETED });
  }

  public async findByUserAndCourseWithAllRelations(
    user: CourseTaken['user'],
    course: CourseTaken['course'],
  ): Promise<CourseTaken> {
    return this.findOne({ user, course });
  }

  public async findCertificateByUserAndCourse(
    user: CourseTaken['user'],
    course: CourseTaken['course'],
  ): Promise<CertificateDTO> {
    return this.findOne({
      user,
      course,
      status: CourseTakenStatusEnum.COMPLETED,
    });
  }

  public async findCertificatesByUserId(
    user: User['id'],
  ): Promise<CertificateDTO[]> {
    return this.find({
      user: user,
      status: CourseTakenStatusEnum.COMPLETED,
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
    return this.findOne({ user, course });
  }

  public async getUsersWithTakenCourses(): Promise<number> {
    // TODO: ci version of mysql has "only_full_group_by", check how to disable it to make this query better
    const entities: any[] = await this.createQueryBuilder('coursetaken')
      .where('coursetaken.status = ?', [CourseTakenStatusEnum.TAKEN])
      .select('coursetaken.user', true)
      .orderBy({ user: 'ASC' })
      .execute();
    return entities.length;
  }

  public async getUsersWithCompletedCourses(): Promise<number> {
    // TODO: ci version of mysql has "only_full_group_by", check how to disable it to make this query better
    const entities: any[] = await this.createQueryBuilder('coursetaken')
      .where('coursetaken.status = ?', [CourseTakenStatusEnum.COMPLETED])
      .select('coursetaken.user', true)
      .orderBy({ user: 'ASC' })
      .execute();
    return entities.length;
  }

  public async getUsersWithCompletedAndTakenCourses(): Promise<number> {
    // TODO: ci version of mysql has "only_full_group_by", check how to disable it to make this query better
    // TODO: Typeorm Bug, getCount query is wrong, check https://github.com/typeorm/typeorm/issues/6522
    const entities: any[] = await this.createQueryBuilder('coursetaken')
      .groupBy('coursetaken.user')
      .execute();
    return entities.length;
  }
}
