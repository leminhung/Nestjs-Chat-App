import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('boostrapp');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'static'));
  app.setGlobalPrefix('v1/api');
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('OpenRestApi Documentation')
    .addServer('v1/api')
    .addBearerAuth(
      {
        description: `This API has beenn created to help developers to prototypate theirs apps easily`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'header',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const swaggerCustomOprions: SwaggerCustomOptions = {
    customSiteTitle: 'OpenRestApi Documentation',
    customCss: '../static/css/style.css',
  };
  SwaggerModule.setup('/docs/v1', app, document, swaggerCustomOprions);

  const port = process.env.PORT || 4000;
  await app.listen(port).then(() => {
    logger.log('listenning on port :' + port);
  });
}
bootstrap();
