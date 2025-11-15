import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus, PaymentType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// https://198a01ce3809.ngrok-free.app/webhooks/verify-payment

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleFlutterwaveWebhook(payload: any, signature: string) {
    const ctx = 'WebhooksService.handleFlutterwaveWebhook';

    try {
      // Verify webhook signature
      const webhookKey = this.configService.get<string>(
        'FLUTTERWAVE.WEBHOOK_KEY',
      );
      if (!webhookKey) {
        this.logger.warn('Flutterwave webhook key not configured');
      } else {
        const hash = crypto
          .createHmac('sha256', webhookKey)
          .update(JSON.stringify(payload))
          .digest('hex');

        if (hash !== signature) {
          throw new BadRequestException('Invalid webhook signature');
        }
      }

      const event = payload.event;
      const data = payload.data;

      console.log(payload);

      this.logger.log(`Received Flutterwave webhook: ${event}`);

      // Handle different event types
      switch (event) {
        case 'charge.completed':
          return await this.handleChargeCompleted(data);
        case 'transfer.completed':
          return await this.handleTransferCompleted(data);
        case 'charge.failed':
          return await this.handleChargeFailed(data);
        case 'transfer.failed':
          return await this.handleTransferFailed(data);
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
          return { success: true, message: 'Event received but not handled' };
      }
    } catch (error) {
      this.logger.error(`${ctx} - Error handling webhook`, error);
      throw error;
    }
  }

  private async handleChargeCompleted(data: any) {
    const txRef = data.tx_ref || data.txRef;
    if (!txRef) {
      this.logger.error('No tx_ref found in charge.completed event');
      return { success: false, message: 'Missing tx_ref' };
    }

    // Find payment by Flutterwave reference
    const payment = await this.prisma.payment.findFirst({
      where: { flutterRef: txRef },
      include: {
        member: {
          include: {
            pack: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for tx_ref: ${txRef}`);
      return { success: false, message: 'Payment not found' };
    }

    // Verify amount matches
    if (data.amount !== payment.amount) {
      this.logger.warn(
        `Amount mismatch for payment ${payment.id}: expected ${payment.amount}, got ${data.amount}`,
      );
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCESS },
    });

    // If it's a CONTRIBUTION, update pack contributions
    if (payment.type === PaymentType.CONTRIBUTION) {
      await this.prisma.pack.update({
        where: { id: payment.member.packId },
        data: {
          currentContributions: {
            increment: payment.amount,
          },
          totalContributions: {
            increment: payment.amount,
          },
        },
      });

      this.logger.log(
        `Contribution successful: Payment ${payment.id}, Pack ${payment.member.packId}`,
      );
    }

    return { success: true, paymentId: payment.id };
  }

  private async handleTransferCompleted(data: any) {
    const reference = data.reference || data.transfer_reference;
    if (!reference) {
      this.logger.error('No reference found in transfer.completed event');
      return { success: false, message: 'Missing reference' };
    }

    // Find payout by Flutterwave reference
    const payment = await this.prisma.payment.findFirst({
      where: { flutterRef: reference },
      include: {
        member: {
          include: {
            pack: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payout not found for reference: ${reference}`);
      return { success: false, message: 'Payout not found' };
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCESS },
    });

    // Mark member as having received payout
    await this.prisma.packMember.update({
      where: { id: payment.memberId },
      data: { hasReceived: true },
    });

    // Update pack round and reset contributions
    await this.prisma.pack.update({
      where: { id: payment.member.packId },
      data: {
        currentRound: { increment: 1 },
        currentContributions: 0,
      },
    });

    this.logger.log(
      `Payout successful: Payment ${payment.id}, Member ${payment.memberId}`,
    );

    return { success: true, paymentId: payment.id };
  }

  private async handleChargeFailed(data: any) {
    const txRef = data.tx_ref || data.txRef;
    if (!txRef) return { success: false, message: 'Missing tx_ref' };

    const payment = await this.prisma.payment.findFirst({
      where: { flutterRef: txRef },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      this.logger.log(`Charge failed: Payment ${payment.id}`);
    }

    return { success: true };
  }

  private async handleTransferFailed(data: any) {
    const reference = data.reference || data.transfer_reference;
    if (!reference) return { success: false, message: 'Missing reference' };

    const payment = await this.prisma.payment.findFirst({
      where: { flutterRef: reference },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      this.logger.log(`Transfer failed: Payment ${payment.id}`);
    }

    return { success: true };
  }
}
