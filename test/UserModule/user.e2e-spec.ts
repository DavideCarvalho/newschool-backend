import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/SecurityModule/entity/role.entity';
import { RoleEnum } from '../../src/SecurityModule/enum/role.enum';
import { ClientCredentials } from '../../src/SecurityModule/entity/client-credentials.entity';
import { ClientCredentialsEnum } from '../../src/SecurityModule/enum/client-credentials.enum';
import { GrantTypeEnum } from '../../src/SecurityModule/enum/grant-type.enum';
import { NewUserDTO } from '../../src/UserModule/dto/new-user.dto';
import { UserUpdateDTO } from '../../src/UserModule/dto/user-update.dto';
import { Constants } from '../../src/CommonsModule/constants';
import { GenderEnum } from '../../src/UserModule/enum/gender.enum';
import { EscolarityEnum } from '../../src/UserModule/enum/escolarity.enum';
import { Collection, Connection, EntityRepository, MikroORM } from 'mikro-orm';
import { getRepositoryToken } from 'nestjs-mikro-orm';

const stringToBase64 = (string: string) => {
  return Buffer.from(string).toString('base64');
};

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let authorization: string;
  let adminRole: Role;
  let orm: MikroORM;
  const adminRoleEnum: RoleEnum = RoleEnum.ADMIN;
  const userUrl = `/${Constants.API_PREFIX}/${Constants.API_VERSION_1}/${Constants.USER_ENDPOINT}`;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    let clientCredentials: ClientCredentials = new ClientCredentials();
    clientCredentials.name = ClientCredentialsEnum['NEWSCHOOL@FRONT'];
    clientCredentials.secret = 'test2';
    clientCredentials.role = savedRole;
    clientCredentials = clientCredentialRepository.create(clientCredentials);
    await clientCredentialRepository.persistAndFlush(clientCredentials);
    console.log(await clientCredentialRepository.findAll());
    console.log(
      await clientCredentialRepository.find({
        name: clientCredentials.name,
        secret: clientCredentials.secret,
      }),
    );
    authorization = stringToBase64(
      `${clientCredentials.name}:${clientCredentials.secret}`,
    );
  });

  it('should add user', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(userUrl)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user1@email.com',
            password: 'mypass',
            urlInstagram: 'instagram',
            urlFacebook: 'facebook',
            name: 'name',
            nickname: 'random nickname',
            gender: GenderEnum.MALE,
            schooling: EscolarityEnum.ENSINO_FUNDAMENTAL_COMPLETO,
            profession: 'random profession',
            birthday: new Date(),
            institutionName: 'random institution',
            address: 'random address',
            role: adminRoleEnum,
          } as NewUserDTO)
          .then(res => console.log(res.body))
          .then(() => done());
      });
  });

  it('should throw if user is missing a required property', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(userUrl)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            password: 'mypass',
            urlInstagram: 'instagram',
            urlFacebook: 'facebook',
            name: 'name',
            role: adminRoleEnum,
          } as NewUserDTO)
          .expect(400)
          .then(() => done());
      });
  });

  it('should find user by id', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(userUrl)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user2@email.com',
            password: 'mypass',
            urlInstagram: 'instagram',
            urlFacebook: 'facebook',
            name: 'name',
            nickname: 'random nickname',
            gender: GenderEnum.MALE,
            schooling: EscolarityEnum.ENSINO_FUNDAMENTAL_COMPLETO,
            profession: 'random profession',
            birthday: new Date(),
            institutionName: 'random institution',
            address: 'random address',
            role: adminRoleEnum,
          } as NewUserDTO)
          .then((_res) => {
            return request(app.getHttpServer())
              .get(`${userUrl}/${_res.body.id}`)
              .set('Authorization', `Bearer ${res.body.accessToken}`)
              .expect((response) => {
                expect(response.body.email).toBe('my-user2@email.com');
              })
              .expect(200)
              .then(() => done());
          });
      });
  });

  it('should update user', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(userUrl)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user3@email.com',
            password: 'mypass',
            urlInstagram: 'instagram',
            urlFacebook: 'facebook',
            name: 'name',
            nickname: 'random nickname',
            gender: GenderEnum.MALE,
            schooling: EscolarityEnum.ENSINO_FUNDAMENTAL_COMPLETO,
            profession: 'random profession',
            birthday: new Date(),
            institutionName: 'random institution',
            address: 'random address',
            role: adminRoleEnum,
          } as NewUserDTO)
          .then((_res) => {
            const updateBody: UserUpdateDTO = {
              id: _res.body.id,
              email: _res.body.email,
              role: adminRoleEnum,
              name: 'updated name',
              nickname: 'random nickname',
              gender: GenderEnum.MALE,
              schooling: EscolarityEnum.ENSINO_FUNDAMENTAL_COMPLETO,
              profession: 'random profession',
              birthday: new Date(),
              institutionName: 'random institution',
              address: 'random adress',
              urlFacebook: _res.body.urlFacebook,
              urlInstagram: _res.body.urlInstagram,
            };
            return request(app.getHttpServer())
              .put(`${userUrl}/${_res.body.id}`)
              .type('form')
              .set('Authorization', `Bearer ${res.body.accessToken}`)
              .send(updateBody)
              .then((__res) => {
                return request(app.getHttpServer())
                  .get(`${userUrl}/${__res.body.id}`)
                  .set('Authorization', `Bearer ${res.body.accessToken}`)
                  .expect((response) => {
                    expect(response.body.name).toBe('updated name');
                  })
                  .then(() => done());
              });
          });
      });
  });

  it('should delete user', async (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .set('Authorization', `Basic ${authorization}`)
      .set('Content-Type', 'multipart/form-data')
      .field('grant_type', GrantTypeEnum.CLIENT_CREDENTIALS)
      .then((res) => {
        return request(app.getHttpServer())
          .post(userUrl)
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .send({
            email: 'my-user4@email.com',
            password: 'mypass',
            urlInstagram: 'instagram',
            urlFacebook: 'facebook',
            name: 'name',
            nickname: 'random nickname',
            gender: GenderEnum.MALE,
            schooling: EscolarityEnum.ENSINO_FUNDAMENTAL_COMPLETO,
            profession: 'random profession',
            birthday: new Date(),
            institutionName: 'random institution',
            role: adminRoleEnum,
          } as NewUserDTO)
          .then((_res) => {
            return request(app.getHttpServer())
              .delete(`${userUrl}/${_res.body.id}`)
              .set('Authorization', `Bearer ${res.body.accessToken}`)
              .then((__res) => {
                return request(app.getHttpServer())
                  .get(`${userUrl}/${__res.body.id}`)
                  .set('Authorization', `Bearer ${res.body.accessToken}`)
                  .expect(404);
              })
              .then(() => done());
          });
      });
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().updateSchema(false, false, true);
  });
});
