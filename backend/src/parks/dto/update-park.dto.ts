import { PartialType } from '@nestjs/mapped-types';
import { CreateParkDto } from './create-park.dto';
import { PackStatus } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class UpdateParkDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  contribution?: number;

  @IsOptional()
  targetAmount?: number;

  @IsOptional()
  totalMembers?: number;
}
