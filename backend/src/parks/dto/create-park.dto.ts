import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateParkDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(10000, { message: 'Contribution must be greater than 10k' })
  contribution: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(10000, { message: 'Target amount must be greater than 10k' })
  targetAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(3, { message: 'Total members must be greater than 3' })
  totalMembers: number;
}

export class AddPackMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
