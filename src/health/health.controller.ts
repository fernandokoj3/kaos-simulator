import { HealthService } from '@/health/health.service';
import {
  Controller,
  Get,
  Put,
  Param,
  Res,
  Logger,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { spawn } from 'node:child_process';

import { HealthResponse } from '@/health/dto/health.response.dto';
import { plainToInstance } from 'class-transformer';
import { STRESS_TMP_DIR } from '~shared/app.constants';
import { StressCpuRequest } from './dto/stress-cpu-request';
import { StressMemoryRequest } from './dto/stress-memory-request';

@Controller('/health')
export class HealthController {
  private LOG = new Logger(HealthController.name);

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
  public stressCpu(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    body: StressCpuRequest,
  ): string {
    const { workers, load, duration } = body;
    const child = spawn('stress-ng', [
      '--cpu',
      workers.toString(),
      '--cpu-load',
      load.toString(),
      '--timeout',
      duration.toString(),
      '--temp-path',
      STRESS_TMP_DIR,
    ]);

    child.on('error', (err) => {
      this.LOG.error(`CPU stress error: ${err}`);
    });

    child.stdout.on('data', (data) => {
      this.LOG.log(`PROGRESS: ${data}`);
    });

    child.stderr.on('data', (data) => {
      this.LOG.error(`PROGRESS: ${data}`);
    });

    child.on('close', (code) => {
      this.LOG.log(`stress CPU finalizado com código: ${code}`);
    });

    return `Stress CPU iniciado: workers=${workers}, load=${load}%, duration=${duration}s`;
  }

  @Put('/stress/memory')
  public stressMemory(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    body: StressMemoryRequest,
  ): string {
    const { workers, memory, duration } = body;
    const child = spawn('stress-ng', [
      '--vm',
      workers.toString(),
      '--vm-bytes',
      memory,
      '--timeout',
      `${duration}s`,
      '--vm-keep',
      '--temp-path',
      STRESS_TMP_DIR,
    ]);

    child.on('error', (err) => {
      this.LOG.error(`Falha ao iniciar stress Memory: ${err}`);
    });

    child.stdout.on('data', (data) => {
      this.LOG.log(`PROGRESS: ${data}`);
    });

    child.stderr.on('data', (data) => {
      this.LOG.error(`PROGRESS: ${data}`);
    });

    child.on('close', (code) => {
      this.LOG.log(`stress Memory finalizado com código: ${code}`);
    });

    return `Stress Memory iniciado: workers=${workers}, memory=${memory}, duration=${duration}s`;
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
