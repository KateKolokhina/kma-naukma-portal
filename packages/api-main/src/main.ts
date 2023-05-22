import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import './dotenv-init';

import { AppModule } from './app.module';
import session from 'express-session';

import passport from 'passport';

import connectRedis from 'connect-redis';
import Redis from 'ioredis';

const port = process.env.PORT ?? 8080;

function applySwagger(
  app: INestApplication,
  options: {
    path: string;
    title?: string;
    description?: string;
    version?: string;
  },
): void {
  const path = options.path;
  const title = options.title ?? 'API';
  const description = options.description;
  const version = options.version ?? 'dev';

  const builder = new DocumentBuilder();
  builder.setTitle(title).setVersion(version);
  if (description) {
    builder.setDescription(description);
  }
  const config = builder.build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document);
}

async function bootstrap(): Promise<INestApplication> {
  const app: INestApplication = await NestFactory.create(AppModule);
  applySwagger(app, {
    path: 'swagger',
  });

  const redisClient = new Redis();
  redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function () {
    console.log('Connected to redis successfully');
  });

  const RedisStore = connectRedis(session);
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
      }),
      saveUninitialized: false,
      name: 'redis-naukma',
      secret: 'tets',
      resave: true,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // sameSite: 'none',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.authenticate(['session']));

  await app.listen(port);
  return app;
}

bootstrap().then(async (app) => {
  console.log(`Application is running on: ${await app.getUrl()}`);
});
