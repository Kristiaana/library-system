import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const users = app.get(UsersService);

  const seedEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.test';
  const seedPass = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  const exists = await users.findByEmail(seedEmail).catch(() => null);
  if (!exists) {
    const passwordHash = await bcrypt.hash(seedPass, 10);
    await users.create({
      email: seedEmail,
      passwordHash,
      role: 'LIBRARIAN',
      active: true,
    });
    console.log(`Seed user created: ${seedEmail} / ${seedPass}`);
  }

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
