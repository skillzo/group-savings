import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentRequestsService } from './payment-requests.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment-requests')
@UseGuards(JwtAuthGuard)
export class PaymentRequestsController {
  constructor(
    private readonly paymentRequestsService: PaymentRequestsService,
  ) {}

  @Post()
  create(
    @Body() createPaymentRequestDto: CreatePaymentRequestDto,
    @UserId() requestorId: string,
  ) {
    return this.paymentRequestsService.create(
      requestorId,
      createPaymentRequestDto,
    );
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @UserId() payerId: string) {
    return this.paymentRequestsService.accept(id, payerId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @UserId() payerId: string) {
    return this.paymentRequestsService.reject(id, payerId);
  }

  @Get('pack/:packId')
  findByPack(@Param('packId') packId: string) {
    return this.paymentRequestsService.findByPack(packId);
  }

  @Get('pending')
  findPendingByPayer(@UserId() payerId: string) {
    return this.paymentRequestsService.findPendingByPayer(payerId);
  }
}
