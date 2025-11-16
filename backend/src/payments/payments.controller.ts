import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentType } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiateContribution(@Body() createPaymentDto: CreatePaymentDto) {
    const payload = {
      ...createPaymentDto,
      type: PaymentType.CONTRIBUTION,
    };
    return this.paymentsService.initiateContribution(payload);
  }

  @Post('initiate-payout')
  initiatePayout(@Body() createPaymentDto: CreatePaymentDto) {
    const payload = {
      ...createPaymentDto,
      type: PaymentType.PAYOUT,
    };
    return this.paymentsService.initiatePayout(payload);
  }

  @Get('verify/:txRef')
  verifyPayment(@Param('txRef') txRef: string) {
    return this.paymentsService.verifyPayment(txRef);
  }

  @Get('verify-payout/:txRef')
  verifyPayout(@Param('txRef') txRef: string) {
    return this.paymentsService.verifyPayout(txRef);
  }

  @Get('user/:id')
  getUserPayments(@Param('id') id: string) {
    return this.paymentsService.getUserPayments(id);
  }

  @Get('pack/:id')
  getPackPayments(@Param('id') id: string) {
    return this.paymentsService.getPackPayments(id);
  }
}
