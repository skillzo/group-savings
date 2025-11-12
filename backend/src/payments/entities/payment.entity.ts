import { PaymentStatus, PaymentType } from '@prisma/client';

export class Payment {
  id: string;
  memberId: string;
  amount: number;
  status: PaymentStatus;
  flutterRef?: string;
  type: PaymentType;
  createdAt: Date;
}
