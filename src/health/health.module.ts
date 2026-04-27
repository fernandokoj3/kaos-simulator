import { MiddlewareConsumer, Module } from '@nestjs/common';
import { HealthController } from '@/health/health.controller';
import { HealthService } from '@/health/health.service';
import { HealthMiddleware } from '@/health/health.middleware';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HealthMiddleware).forRoutes('*');
  }
}
