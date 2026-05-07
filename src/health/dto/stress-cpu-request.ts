import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StressCpuRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  workers: number = 2;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  load: number = 70;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number = 30;
}
