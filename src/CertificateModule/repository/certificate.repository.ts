import { Certificate } from '../entity/certificate.entity';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(Certificate)
export class CertificateRepository extends EntityRepository<Certificate> {
  public async findById(id: string): Promise<Certificate | undefined> {
    return this.findOne({ id });
  }
}
