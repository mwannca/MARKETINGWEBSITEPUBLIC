import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    cors({
      origin: 'https://localhost:4000', // Allow requests from your frontend
    }),
  );
  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for my NestJS backend')
    .setVersion('1.0')
    .addBearerAuth() // Add Bearer Auth for JWT-secured endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4000);
  Logger.log('Server running at https://localhost:4000');
}

bootstrap();
