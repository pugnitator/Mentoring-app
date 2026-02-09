import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Увеличиваем лимит тела запроса для JSON/URL‑encoded (для загрузки аватаров в base64)
  app.use(json({ limit: '1mb' }));
  app.use(
    urlencoded({
      limit: '1mb',
      extended: true,
    }),
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // В одном образе (Docker): раздаём собранный фронт из ./client, SPA fallback (при node dist/src/main.js -> __dirname = .../dist/src)
  const clientPath = join(__dirname, '..', '..', 'client');
  if (existsSync(clientPath)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(clientPath));
    expressApp.get('*', (req: { path: string }, res: { sendFile: (p: string) => void }, next: () => void) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(join(clientPath, 'index.html'));
    });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}/api`);
}
bootstrap();
