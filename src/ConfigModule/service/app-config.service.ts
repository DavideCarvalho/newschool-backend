import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter, MailerOptions } from '@nest-modules/mailer';
import * as path from 'path';
import { MikroOrmModuleOptions } from 'nestjs-mikro-orm';
import Rollbar = require('rollbar');
import globby = require('globby');
import { Certificate } from '../../CertificateModule/entity/certificate.entity';
import { Course } from '../../CourseModule/entity/course.entity';
import { Lesson } from '../../CourseModule/entity/lesson.entity';
import { Part } from '../../CourseModule/entity/part.entity';
import { Test } from '../../CourseModule/entity/test.entity';
import { CourseTaken } from '../../CourseTakenModule/entity/course.taken.entity';
import { Templates } from '../../MessageModule/entity/templates.entity';
import { ClientCredentials } from '../../SecurityModule/entity/client-credentials.entity';
import { Role } from '../../SecurityModule/entity/role.entity';
import { ChangePassword } from '../../UserModule/entity/change-password.entity';
import { User } from '../../UserModule/entity/user.entity';
import { Audit } from '../../CommonsModule/entity/audit.entity';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  changePasswordExpirationTime: number = this.configService.get<number>(
    'CHANGE_PASSWORD_EXPIRATION_TIME',
  );

  nodeEnv: string = this.configService.get<string>('NODE_ENV');
  port: number = this.configService.get<number>('PORT');

  expiresInAccessToken: string = this.configService.get<string>(
    'EXPIRES_IN_ACCESS_TOKEN',
  );
  expiresInRefreshToken: string = this.configService.get<string>(
    'EXPIRES_IN_REFRESH_TOKEN',
  );

  smtpHost: string = this.configService.get<string>('SMTP_HOST');
  smtpPort: number = this.configService.get<number>('SMTP_PORT');
  smtpSecure: boolean | undefined = this.configService.get<boolean | undefined>(
    'SMTP_SECURE',
  );
  smtpRequireTls: boolean = this.configService.get<boolean>('SMTP_REQUIRE_TLS');
  smtpUser: string = this.configService.get<string>('SMTP_USER');
  smtpPassword: string = this.configService.get<string>('SMTP_PASSWORD');
  smtpFrom: string = this.configService.get<string>('SMTP_FROM');

  emailContactUs: string = this.configService.get<string>('EMAIL_CONTACTUS');
  frontUrl: string = this.configService.get<string>('FRONT_URL');
  changePasswordFrontUrl: string = this.configService.get<string>(
    'CHANGE_PASSWORD_URL',
  );

  databaseHost: string = this.configService.get<string>('DATABASE_HOST');
  databaseName: string = this.configService.get<string>('DATABASE_NAME');
  databasePort: number = this.configService.get<number>('DATABASE_PORT');
  databaseUsername: string = this.configService.get<string>(
    'DATABASE_USERNAME',
  );
  databasePassword: string = this.configService.get<string>(
    'DATABASE_PASSWORD',
  );
  synchronize: boolean = this.configService.get<boolean>('SYNC_DATABASE');
  logging: boolean = this.configService.get<string>('NODE_ENV') !== 'TEST';

  public getRollbarConfiguration(): Rollbar.Configuration {
    return {
      accessToken: this.configService.get<string>('ROLLBAR_TOKEN'),
      captureUncaught: true,
      captureUnhandledRejections: true,
    };
  }

  public getChangePasswordFrontUrl(changePasswordRequestId): string {
    return `${this.frontUrl}/${this.changePasswordFrontUrl}/${changePasswordRequestId}`;
  }

  public getSmtpConfiguration(): MailerOptions {
    return {
      transport: {
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpSecure,
        requireTLS: this.smtpRequireTls,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPassword,
        },
      },
      template: {
        dir: path.resolve(path.join(__dirname, '..', '..')) + '/../templates',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    };
  }

  public async getDatabaseConfig2(): Promise<MikroOrmModuleOptions> {
    let logger = (message): void => {
      console.log(message);
    };
    if (!this.logging) {
      logger = (): {} => ({});
    }
    return {
      type: 'mysql',
      multipleStatements: true,
      entities: [
        Audit,
        Certificate,
        Course,
        Lesson,
        Part,
        Test,
        CourseTaken,
        Templates,
        ClientCredentials,
        Role,
        ChangePassword,
        User,
      ],
      host: this.databaseHost,
      dbName: this.databaseName,
      port: this.databasePort,
      user: this.databaseUsername,
      password: this.databasePassword,
      logger,
    };
  }

  // public getDatabaseConfig(): MysqlConnectionOptions {
  //   return {
  //     type: 'mysql',
  //     multipleStatements: true,
  //     entities: [
  //       path.resolve(path.join(__dirname, '..', '..')) +
  //         '/**/*.entity{.ts,.js}',
  //     ],
  //     host: this.databaseHost,
  //     database: this.databaseName,
  //     port: this.databasePort,
  //     username: this.databaseUsername,
  //     password: this.databasePassword,
  //     synchronize: this.synchronize || false,
  //     logging: this.logging,
  //   };
  // }
}
