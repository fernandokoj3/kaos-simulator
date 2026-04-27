import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';

import { PORT, SIGTERM_SECONDS } from '~shared/app.constants';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(process.cwd(), 'public', 'views'));
  app.setViewEngine('ejs');
  app.useLogger(app.get(Logger));

  const logger = app.get(Logger);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGTERM', async () => {
    logger.warn(
      {
        signal: 'SIGTERM',
        gracePeriodMs: SIGTERM_SECONDS,
      },
      'Shutdown signal received',
    );

    await new Promise((resolve) => setTimeout(resolve, SIGTERM_SECONDS));

    logger.log('Closing Nest application');

    await app.close();

    logger.log('Application shutdown complete');

    process.exit(0);
  });

  await app.listen(PORT);
}

void bootstrap();
