import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { HealthResponse } from '@/health/dto/health.response.dto';

@Injectable()
export class HealthService {
  private health = true;
  private readTime = new Date(Date.now());

  check(): HealthResponse {
    return plainToInstance(
      HealthResponse,
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  isHealthy(): boolean {
    return this.health;
  }

  setUnhealthy(): void {
    this.health = false;
  }

  isReady(): boolean {
    return this.readTime < new Date(Date.now());
  }

  unreadFor(seconds: number): void {
    this.readTime = new Date(Date.now() + seconds * 1000);
  }
}
