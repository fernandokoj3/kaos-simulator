import { IsInt, IsOptional, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StressMemoryRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  workers: number = 2;

  // aceita 256M, 1G, 512K...
  @IsOptional()
  @Matches(/^\d+(K|M|G)$/i, {
    message: 'memory should on format like 256M, 1G or 512K',
  })
  memory: string = '256M';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number = 30;
}
