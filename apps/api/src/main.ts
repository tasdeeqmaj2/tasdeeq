import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { auth } from './auth/auth.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // better-auth routes live at /api/auth/*.
  // Scope the handler to that prefix — toNodeHandler is not an Express
  // middleware and will swallow non-auth requests with a 404 if applied
  // globally.
  const authHandler = toNodeHandler(auth);
  app.use((req: any, res: any, next: () => void) => {
    if ((req.url as string)?.startsWith('/api/auth')) {
      return authHandler(req, res);
    }
    next();
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin:
      process.env.ALLOWED_ORIGINS?.split(',') ?? [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
      ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
