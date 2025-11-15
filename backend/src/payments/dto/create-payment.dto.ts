import { PaymentType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;
}
