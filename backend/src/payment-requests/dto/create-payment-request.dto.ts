import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  payerId: string; // User B - the one who will pay

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  packId: string;
}
