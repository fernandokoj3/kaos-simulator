import { HealthService } from '@/health/health.service';
import { Controller, Get, Put, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { exec } from 'child_process';

import { HealthResponse } from '@/health/dto/health.response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Put('/exit/success')
  public exitSuccess(): string {
    process.exit(0);
  }

  @Put('/exit/fail')
  public exitFail(): string {
    process.exit(1);
  }

  @Put('/stress/cpu')
  public stressCpu(@Query('duration') duration = '30'): string {
    exec(`stress -c 1k -t ${duration}s`);
    return `Aplicação em estresse de CPU por ${duration} segundos.`;
  }

  @Put('/stress/memory')
  public stressMemory(@Query('duration') duration = '30'): string {
    exec(`stress --vm 1 --vm-bytes 1024M -t ${duration}s`);
    return `Aplicação em estresse de memória por ${duration} segundos.`;
  }

  @Get('/')
  public health(@Res() res: Response) {
    if (this.healthService.isHealthy()) {
      const result = plainToInstance(
        HealthResponse,
        {
          status: 'ok',
          timestamp: new Date().toISOString(),
        },
        { excludeExtraneousValues: true },
      );
      return res.status(200).send(result);
    }
    const result = plainToInstance(
      HealthResponse,
      {
        status: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { excludeExtraneousValues: true },
    );
    return res.status(500).send(result);
  }

  @Get('/ready')
  public ready(@Res() res: Response) {
    if (this.healthService.isReady()) {
      return res.status(200).send('Ok');
    }

    return res.status(500).send('');
  }

  @Put('/unhealth')
  public unhealth(): string {
    this.healthService.setUnhealthy();
    return 'A aplicação agora está fora.';
  }

  @Put('/unreadfor/:seconds')
  public unreadFor(@Param('seconds') seconds: string): string {
    this.healthService.unreadFor(Number(seconds));
    return `A aplicação ficará indisponível por ${seconds} segundos.`;
  }
}
