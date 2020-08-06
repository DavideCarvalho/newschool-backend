import { ClientCredentials } from '../entity/client-credentials.entity';
import { ClientCredentialsEnum } from '../enum/client-credentials.enum';
import { EntityRepository, Repository } from 'mikro-orm';

@Repository(ClientCredentials)
export class ClientCredentialsRepository extends EntityRepository<
  ClientCredentials
> {
  async findByNameAndSecret(name: ClientCredentialsEnum, secret: string) {
    return this.findOne({ name, secret });
  }
}
