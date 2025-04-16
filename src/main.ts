import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';
import compression from '@fastify/compress';
import fastifyCsrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Create Fastify instance with optimized settings
  const fastifyAdapter = new FastifyAdapter({
    logger: process.env.NODE_ENV !== 'production',
    maxParamLength: 100,
    connectionTimeout: 60000, // 60 seconds
    bodyLimit: 1048576, // 1MB
    trustProxy: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { bufferLogs: true }
  );

  const configService = app.get(ConfigService);

  // Enable compression
  await app.register(compression, { encodings: ['gzip', 'deflate'] });

  // Add security headers
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  });

  // Add CSRF protection
  await app.register(fastifyCsrf);

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://unsrate.com', 'https://api.unsrate.com']
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Start the server
  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Initialize Firebase
  const firebaseKeyFilePath = 'unsrate-firebase-adminsdk-fbsvc-2332f1547f.json';
  const firebaseServiceAccount = JSON.parse(
    fs.readFileSync(firebaseKeyFilePath).toString(),
  );
  if (firebaseAdmin.apps.length === 0) {
    console.log('Initialize Firebase Application.');
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
    });
  }
}
bootstrap();
