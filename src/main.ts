import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './CommonsModule/httpFilter/http-exception.filter';
import 'reflect-metadata';
import * as path from 'path';
import { AppConfigService as ConfigService } from './ConfigModule/service/app-config.service';
import { MikroORM } from 'mikro-orm';

async function bootstrap() {
  require('dotenv-flow').config();
  (global as any).appRoot = path.resolve(__dirname);

  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  const options = new DocumentBuilder()
    .setTitle('@NewSchool/back')
    .setDescription('Backend para o projeto NewSchool')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const appConfigService = app.get<ConfigService>(ConfigService);
  if (appConfigService.synchronize) {
    const orm = app.get<MikroORM>(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
  }

  app.useGlobalFilters(new HttpExceptionFilter(appConfigService));

  await app.listen(appConfigService.port || 8080);
}

bootstrap();
