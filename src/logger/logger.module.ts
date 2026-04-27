import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { APP_TITLE } from '~shared/app.constants';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',

        genReqId: (req) =>
          req.headers['x-request-id']?.toString() || randomUUID(),

        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,

        formatters: {
          level: (label) => ({
            level: label,
          }),
        },

        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

        customProps: () => ({
          service: APP_TITLE,
          environment: process.env.NODE_ENV || 'development',
        }),

        serializers: {
          req(req: Request) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
            };
          },

          res(res: Response) {
            return {
              statusCode: res.statusCode,
            };
          },

          err(err: Error) {
            return {
              type: err.name,
              message: err.message,
              stack: err.stack,
            };
          },
        },

        autoLogging: true,
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
