import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { HealthService } from './health.service';

@Injectable()
export class HealthMiddleware implements NestMiddleware {
  constructor(private readonly healthService: HealthService) {}

  use(_: Request, res: Response, next: NextFunction) {
    if (this.healthService.isHealthy()) {
      return next();
    }

    return res.status(500).send('');
  }
}
