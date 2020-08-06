import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateRepository } from '../repository/certificate.repository';
import { Certificate } from '../entity/certificate.entity';
import { NewCertificateDTO } from '../dto/new-certificate.dto';
import { CertificateDTO } from '../dto/certificate.dto';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly repository: CertificateRepository,
  ) {}

  public async findAll(): Promise<Certificate[]> {
    return this.repository.findAll();
  }

  async save(certificate: NewCertificateDTO): Promise<Certificate> {
    const createdCertificate = await this.repository.create(certificate);
    await this.repository.persistAndFlush(createdCertificate);
    return createdCertificate;
  }

  public async findById(id: Certificate['id']): Promise<Certificate> {
    const foundCertificate:
      | Certificate
      | undefined = await this.repository.findById(id);
    if (!foundCertificate) {
      throw new NotFoundException('Certificate not found');
    }
    return foundCertificate;
  }

  public async update(
    id: Certificate['id'],
    certificate: CertificateDTO,
  ): Promise<Certificate> {
    const foundCertificate: Certificate = await this.findById(id);
    return this.save({ ...foundCertificate, ...certificate });
  }

  public async delete(id: Certificate['id']) {
    await this.findById(id);
    await this.repository.remove({ id });
    await this.repository.flush();
  }
}
