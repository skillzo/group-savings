import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PackStatus, PaymentStatus, PaymentType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { handleServiceError } from 'src/util/error-handler.util';
import { ServiceResponse } from 'src/common/serviceResponse1';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async initiateContribution(dto: CreatePaymentDto) {
    const ctx = 'PaymentsService.initiateContribution';

    try {
      const member = await this.prisma.packMember.findUnique({
        where: { id: dto.memberId },
        include: {
          pack: true,
          user: true,
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }
      if (member.hasContributed) {
        throw new BadRequestException(
          'You have already contributed to this pack',
        );
      }

      if (
        dto.type === PaymentType.CONTRIBUTION &&
        dto.amount !== member.pack.contribution
      ) {
        throw new BadRequestException(
          `You can only contribute ${member.pack.contribution?.toLocaleString()} NGN in this pack`,
        );
      }

      // Check if member already has a pending payment for current round
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          memberId: dto.memberId,
          status: PaymentStatus.PENDING,
          type: dto.type,
        },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'You already have a pending payment, your payment will be processed in a few minutes',
        );
      }

      const txRef = randomUUID();

      const payload = {
        tx_ref: txRef,
        amount: dto.amount,
        currency: 'NGN',
        redirect_url: `${this.configService.get('FRONTEND_URL')}/payment-status?packId=${member.pack.id}`,
        customer: {
          email: member.user.email,
          name: member.user.name,
          phonenumber: member.user.phone,
          userId: member.user.id,
          memberId: member.id,
        },
        customizations: {
          title: `${member.pack.name} - (${member.user.name})`,
          description: `Contribution to ${member.pack.name}`,
        },
      };

      const flwResponse = await firstValueFrom(
        this.httpService.post(
          `${this.configService.get('FLUTTERWAVE.BASE_URL')}/payments`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (flwResponse.data.status !== 'success') {
        handleServiceError(
          flwResponse.data.message || 'Failed to initiate payment',
          'PaymentsService.initiatePayment',
          this.logger,
        );
      }

      await this.prisma.payment.create({
        data: {
          memberId: dto.memberId,
          amount: dto.amount,
          status: PaymentStatus.PENDING,
          flutterRef: txRef,
          type: dto.type,
          userId: member.user.id,
        },
      });

      return ServiceResponse.success('Payment initiated successfully', {
        redirectUrl: flwResponse.data.data.link,
        transactionId: txRef,
        packId: member.pack.id,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async initiatePayout(dto: CreatePaymentDto) {
    const member = await this.prisma.packMember.findUnique({
      where: { id: dto.memberId },
      include: {
        pack: true,
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // check if pack is active
    if (member.pack.status !== PackStatus.ACTIVE) {
      throw new BadRequestException('Pack is not active');
    }

    // check member order
    if (member.order !== member.pack.currentRound) {
      throw new BadRequestException(
        `You are not the next in line to receive a payout: Current round is ${member.pack.currentRound} and your order is ${member.order}`,
      );
    }

    if (member.hasReceived) {
      throw new BadRequestException('Member has already received their payout');
    }

    // check account number
    if (!member.user.accountNumber || !member.user.accountName) {
      throw new BadRequestException(
        'Account details required. Please update your profile with your account number and account name.',
      );
    }

    // check if contribition amount is complete
    if (member.pack.currentContributions !== member.pack.targetAmount) {
      throw new BadRequestException(
        'Contribution amount is not complete. Please contribute the remaining amount.',
      );
    }

    // check if payout amount is complete
    if (dto.amount !== member.pack.targetAmount) {
      throw new BadRequestException(
        `Payout amount must be ${member.pack.targetAmount.toLocaleString()} NGN`,
      );
    }

    // check for existing payout
    const existingPayout = await this.prisma.payment.findFirst({
      where: {
        memberId: dto.memberId,
        status: PaymentStatus.PENDING,
        type: dto.type,
      },
    });

    if (existingPayout) {
      throw new BadRequestException(
        'You already have a pending payout, your payout will be processed in a few minutes',
      );
    }

    const txRef = randomUUID();
    const payload = {
      account_bank: '044',
      account_number: '0690000040', // staging account number
      amount: member.pack.contribution,
      narration: `Payout to ${member.user.name} for pack ${member.pack.name}`,
      currency: 'NGN',
      reference: txRef,
      callback_url: `${this.configService.get('FRONTEND_URL')}/payment-status`,
      meta: {
        userId: member.user.id,
        memberId: member.id,
        packId: member.pack.id,
        email: member.user.email,
      },
    };

    const flwResponse = await firstValueFrom(
      this.httpService.post(
        `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transfer`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    if (flwResponse.data.status !== 'success') {
      handleServiceError(
        flwResponse.data.message || 'Failed to initiate payout',
        'PaymentsService.initiatePayout',
        this.logger,
      );
    }

    await this.prisma.payment.create({
      data: {
        memberId: dto.memberId,
        amount: dto.amount,
        status: PaymentStatus.PENDING,
        flutterRef: txRef,
        type: dto.type,
        userId: member.user.id,
      },
    });

    return ServiceResponse.success('Payout initiated successfully', {
      transactionId: txRef,
    });
  }

  async verifyPayment(txRef: string) {
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

    if (payment.status === PaymentStatus.SUCCESS) {
      return ServiceResponse.success('Payment already verified', {
        paymentId: payment.id,
        amount: payment.amount,
      });
    }

    // check flutterwave
    const flwResponse = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transactions/verify_by_reference?tx_ref=${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
          },
        },
      ),
    );

    if (flwResponse.data.status !== 'success') {
      handleServiceError(
        flwResponse.data.message || 'Failed to verify payment',
        'PaymentsService.verifyPayment',
        this.logger,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS },
      });

      // update pack member has contributed
      await tx.packMember.update({
        where: { id: payment.memberId },
        data: { hasContributed: true },
      });

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
      }
    });

    this.logger.log(
      `Contribution successful: Payment ${payment.id}, Pack ${payment.member.packId}`,
    );
    return ServiceResponse.success('Payment verified successfully', {
      paymentId: payment.id,
      amount: payment.amount,
    });
  }

  async verifyPayout(txRef: string) {
    const ctx = 'PaymentsService.verifyPayout';
    try {
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
        this.logger.warn(`Payout not found for reference: ${txRef}`);
        return ServiceResponse.error('Payout not found');
      }

      // Check if it's a payout type
      if (payment.type !== PaymentType.PAYOUT) {
        throw new BadRequestException('Payment is not a payout');
      }

      // Check if already verified
      if (payment.status === PaymentStatus.SUCCESS) {
        return ServiceResponse.success('Payout already verified', {
          paymentId: payment.id,
          amount: payment.amount,
        });
      }

      // Verify with Flutterwave Transfer API
      const flwResponse = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transfers/${txRef}`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
            },
          },
        ),
      );

      if (flwResponse.data.status !== 'success') {
        handleServiceError(
          flwResponse.data.message || 'Failed to verify payout',
          ctx,
          this.logger,
        );
      }

      const transferData = flwResponse.data.data;
      const pack = payment.member.pack;
      const newRound = pack.currentRound + 1;
      const isComplete = newRound > pack.totalMembers;

      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.SUCCESS },
        });

        await tx.packMember.update({
          where: { id: payment.memberId },
          data: { hasReceived: true },
        });

        await tx.pack.update({
          where: { id: payment.member.packId },
          data: {
            currentRound: { increment: 1 },
            currentContributions: 0,
            status: isComplete ? PackStatus.COMPLETED : PackStatus.ACTIVE,
          },
        });
      });

      this.logger.log(
        `Payout successful: Payment ${payment.id}, Pack ${payment.member.packId}`,
      );
      return ServiceResponse.success('Payout verified successfully', {
        paymentId: payment.id,
        amount: payment.amount,
        packId: payment.member.packId,
        round: newRound,
        isComplete: isComplete,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getUserPayments(id: string) {
    const ctx = 'PaymentsService.getUserPayments';
    try {
      const payments = await this.prisma.payment.findMany({
        where: { userId: id },
      });

      const totalContributions = payments.reduce(
        (acc, payment) => acc + payment.amount,
        0,
      );

      return ServiceResponse.success('User payments fetched successfully', {
        payments,
        totalContributions,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getPackPayments(packId: string) {
    const ctx = 'PaymentsService.getPackPayments';
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          member: {
            packId: packId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return ServiceResponse.success(
        'Pack payments fetched successfully',
        payments,
      );
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getPaymentById(id: string) {
    const ctx = 'PaymentsService.getPaymentById';
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: id },
      });
      return ServiceResponse.success('Payment fetched successfully', payment);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async startNextRound(packId: string) {
    const ctx = 'PaymentsService.startNextRound';
    try {
      const pack = await this.prisma.pack.findUnique({
        where: { id: packId },
        include: {
          members: true,
        },
      });

      if (!pack) {
        throw new NotFoundException('Pack not found');
      }

      if (pack.status !== PackStatus.ACTIVE) {
        throw new BadRequestException('Pack is not active');
      }

      // Check if all members have contributed in current round
      const membersNotContributed = pack.members.filter(
        (member) => !member.hasContributed,
      );
      if (membersNotContributed.length > 0) {
        throw new BadRequestException(
          `Cannot start new round. ${membersNotContributed.length} member(s) have not contributed yet`,
        );
      }

      // Calculate new round
      const newRound = pack.currentRound + 1;
      const isComplete = newRound > pack.totalMembers;

      await this.prisma.$transaction(async (tx) => {
        await tx.pack.update({
          where: { id: packId },
          data: {
            currentRound: 1,
            currentContributions: 0,
            status: isComplete ? PackStatus.COMPLETED : PackStatus.ACTIVE,
          },
        });

        // Reset member flags for new round
        await tx.packMember.updateMany({
          where: { packId: packId },
          data: {
            hasContributed: false, // All members need to contribute again
            hasReceived: false, // Reset so next person in order can receive
          },
        });
      });

      this.logger.log(
        `New round started: Pack ${packId}, Round ${newRound}, Complete: ${isComplete}`,
      );

      return ServiceResponse.success('New round started successfully', {
        packId,
        status: PackStatus.ACTIVE,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }
}

// if (isComplete) {
//   await tx.packMember.updateMany({
//     where: { packId: pack.id },
//     data: {
//       hasContributed: false,
//       hasReceived: false,
//     },
//   });

//   await tx.pack.update({
//     where: { id: pack.id },
//     data: {
//       currentRound: 1,
//       currentContributions: 0,
//       status: PackStatus.ACTIVE,
//     },
//   });
// }
