import { PaymentRequestStatus } from '@prisma/client';

export class PaymentRequest {
  id: string;
  requestorId: string;
  payerId: string;
  packId: string;
  requestedAmount: number;
  interestRate: number;
  status: PaymentRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
