import { User } from '../entity/user.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(User)
export class UserRepository extends EntityRepository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email });
  }

  async findByIdWithCertificates(id: string): Promise<User | undefined> {
    return this.findOneOrFail({ id });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getCertificateByUser(userId): Promise<any[]> {
    return await this.createQueryBuilder('user')
      .join(
        'certificate_users_user',
        'certificate_user',
        { $eq: userId },
        'innerJoin',
      )
      .join(
        'certificate',
        'certificate',
        { $eq: 'certificate_user.certificateId' },
        'innerJoin',
      )
      .where('user.id = ?', [userId])
      .execute();
  }

  async findByIdWithCourses(id: string): Promise<User | undefined> {
    return this.findOneOrFail({ id });
  }

  async findByEmailAndFacebookId(
    email: string,
    facebookId: string,
  ): Promise<User> {
    return this.findOne({ email, facebookId });
  }

  getUsersQuantity(): Promise<number> {
    return this.count();
  }

  // #TODO: Criar lógica de usuários ativos
  getActiveUsersQuantity(): Promise<number> {
    return this.count();
  }

  // #TODO: Criar lógica de usuários inativos
  getInactiveUsersQuantity(): Promise<number> {
    return this.count();
  }
}
