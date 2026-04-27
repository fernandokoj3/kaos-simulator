import { Module } from '@nestjs/common';

import { HealthController } from './health/health.controller';
import { HealthService } from '@/health/health.service';
import { AppController } from '@/app.controller';
import { LoggerModule } from '@/logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [AppController, HealthController],
  providers: [HealthService],
})
export class AppModule {}
