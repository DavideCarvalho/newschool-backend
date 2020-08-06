import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/SecurityModule/entity/role.entity';
import { RoleEnum } from '../../src/SecurityModule/enum/role.enum';
import { ClientCredentials } from '../../src/SecurityModule/entity/client-credentials.entity';
import { ClientCredentialsEnum } from '../../src/SecurityModule/enum/client-credentials.enum';
import { GrantTypeEnum } from '../../src/SecurityModule/enum/grant-type.enum';
import { EmailDTO } from '../../src/MessageModule/dto/email.dto';
import { ContactUsDTO } from '../../src/MessageModule/dto/contactus.dto';
import { MailerService } from '@nest-modules/mailer';
import { Constants } from '../../src/CommonsModule/constants';
import { EntityRepository, MikroORM } from 'mikro-orm';
import { getRepositoryToken } from 'nestjs-mikro-orm';

const stringToBase64 = (string: string) => {
  return Buffer.from(string).toString('base64');
};

describe('MessageController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let orm: MikroORM;
  let authorization: string;
  let adminRole: Role;
  const messageUrl = `/${Constants.API_PREFIX}/${Constants.API_VERSION_1}/${Constants.MESSAGE_ENDPOINT}`;

  const mailerServiceMock = {
    sendMail() {
      console.log('email sent');
    },
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    orm = moduleFixture.get(MikroORM);

    const roleRepository: EntityRepository<Role> = moduleFixture.get<
      EntityRepository<Role>
    >(getRepositoryToken(Role));
    const role: Role = new Role();
    role.name = RoleEnum.ADMIN;
    const savedRole = await roleRepository.create(role);
    await roleRepository.persistAndFlush(savedRole);
    adminRole = savedRole;

    const clientCredentialRepository: EntityRepository<ClientCredentials> = moduleFixture.get<
      EntityRepository<ClientCredentials>
    >(getRepositoryToken(ClientCredentials));
    const clientCredentials: ClientCredentials = new ClientCredentials();
    clientCredentials.name = ClientCredentialsEnum['NEWSCHOOL@EXTERNAL'];
    clientCredentials.secret = 'NEWSCHOOL@EXTERNALSECRET';
    clientCredentials.role = savedRole;
    const savedClientCredentials = await clientCredentialRepository.create(
      clientCredentials,
    );
    await clientCredentialRepository.persistAndFlush(savedClientCredentials);
    authorization = stringToBase64(
      `${clientCredentials.name}:${clientCredentials.secret}`,
    );
  });

  it('should send email', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(`${messageUrl}/email`)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user1@email.com',
            title: 'teste',
            message: 'lore ypsulum teste',
            name: 'Aluno',
          } as EmailDTO)
          .expect(200)
          .then(() => done());
      });
  });

  it('should send contact us email', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(`${messageUrl}/email/contactus`)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user1@email.com',
            message: 'lore ypsulum teste',
            name: 'Aluno',
            cellphone: '11900001111',
          } as ContactUsDTO)
          .expect(200)
          .then(() => done());
      });
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().updateSchema(false, false, true);
    await app.close();
  });
});
