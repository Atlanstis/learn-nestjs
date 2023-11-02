import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    logger: ['error', 'warn', 'log'],
  });
  const port = 3000;
  await app.listen(port);
  logger.log(`Server running on port: ${port}`);
}
bootstrap();
