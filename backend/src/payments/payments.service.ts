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

  /**
   * Initiates a Flutterwave payment and returns the response
   */
  private async initiateFlutterwavePayment(params: {
    amount: number;
    packId: string;
    customer: {
      email: string;
      name: string;
      phone: string | null;
      userId: string;
      memberId: string;
    };
    title: string;
    description: string;
    txRef?: string;
  }) {
    const txRef = params.txRef || randomUUID();

    const payload = {
      tx_ref: txRef,
      amount: params.amount,
      currency: 'NGN',
      redirect_url: `${this.configService.get('FRONTEND_URL')}/payment-status?packId=${params.packId}`,
      customer: {
        email: params.customer.email,
        name: params.customer.name,
        phonenumber: params.customer.phone,
        userId: params.customer.userId,
        memberId: params.customer.memberId,
      },
      customizations: {
        title: params.title,
        description: params.description,
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
        'PaymentsService.initiateFlutterwavePayment',
        this.logger,
      );
    }

    return {
      flwResponse,
      txRef,
    };
  }

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

      // Check if member owes interest and if it's due in current round
      let paymentAmount = dto.amount;
      let includesInterest = false;

      if (
        member.owesInterest &&
        member.interestAmount &&
        member.interestDueRound === member.pack.currentRound
      ) {
        // Add interest to payment amount
        paymentAmount = member.pack.contribution + member.interestAmount;
        includesInterest = true;
      }

      if (
        dto.type === PaymentType.CONTRIBUTION &&
        dto.amount !== member.pack.contribution &&
        !includesInterest
      ) {
        throw new BadRequestException(
          `You can only contribute ${member.pack.contribution?.toLocaleString()} NGN in this pack`,
        );
      }

      // If interest is included, validate the total amount
      if (
        dto.type === PaymentType.CONTRIBUTION &&
        includesInterest &&
        dto.amount !== paymentAmount
      ) {
        throw new BadRequestException(
          `Your payment amount should be ${paymentAmount.toLocaleString()} NGN (${member.pack.contribution.toLocaleString()} contribution + ${member.interestAmount?.toLocaleString()} interest)`,
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

      const { flwResponse, txRef } = await this.initiateFlutterwavePayment({
        amount: paymentAmount,
        packId: member.pack.id,
        customer: {
          email: member.user.email,
          name: member.user.name,
          phone: member.user.phone,
          userId: member.user.id,
          memberId: member.id,
        },
        title: `${member.pack.name} - (${member.user.name})`,
        description: includesInterest
          ? `Contribution + Interest to ${member.pack.name}`
          : `Contribution to ${member.pack.name}`,
      });

      await this.prisma.payment.create({
        data: {
          memberId: dto.memberId,
          amount: paymentAmount, // Store the actual amount paid (includes interest if applicable)
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

  async initiateContributionForMember(
    memberId: string,
    payerUserId: string,
    amount?: number,
  ) {
    const ctx = 'PaymentsService.initiateContributionForMember';

    try {
      const member = await this.prisma.packMember.findUnique({
        where: { id: memberId },
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
          'This member has already contributed to this pack',
        );
      }

      // Get payer's user details for payment
      const payer = await this.prisma.user.findUnique({
        where: { id: payerUserId },
      });

      if (!payer) {
        throw new NotFoundException('Payer not found');
      }

      // Use provided amount or pack contribution
      const paymentAmount = amount || member.pack.contribution;

      // Check if member already has a pending payment for current round
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          memberId: memberId,
          status: PaymentStatus.PENDING,
          type: PaymentType.CONTRIBUTION,
        },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'This member already has a pending payment',
        );
      }

      const { flwResponse, txRef } = await this.initiateFlutterwavePayment({
        amount: paymentAmount,
        packId: member.pack.id,
        customer: {
          email: payer.email,
          name: payer.name,
          phone: payer.phone,
          userId: payer.id,
          memberId: member.id,
        },
        title: `${member.pack.name} - Payment for ${member.user.name}`,
        description: `Paying for ${member.user.name}'s contribution to ${member.pack.name}`,
      });

      await this.prisma.payment.create({
        data: {
          memberId: memberId, // Member being paid for (User A)
          amount: paymentAmount,
          status: PaymentStatus.PENDING,
          flutterRef: txRef,
          type: PaymentType.CONTRIBUTION,
          userId: payerUserId, // Payer's user ID (User B)
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
        `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transfers`,
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
      flutterRef: flwResponse.data.data,
      redirectUrl: `${this.configService.get('FRONTEND_URL')}/payment-status?packId=${member.pack.id}&tx_ref=${txRef}&type=payout`,
    });
  }

  async verifyPayment(txRef: string) {
    const ctx = 'PaymentsService.verifyPayment';
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

    let flwResponse: any;
    try {
      flwResponse = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transactions/verify_by_reference?tx_ref=${txRef}`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
            },
          },
        ),
      );
      console.log('flwResponse', flwResponse.data.response.data);
    } catch (error) {
      this.logger.error(
        `${ctx} - Flutterwave API error for tx_ref: ${txRef}`,
        error,
      );
      console.log('error for flutterwave', error.response.data);

      if (
        error?.response?.status === 404 ||
        error?.response?.data?.status === 'error'
      ) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED },
        });

        return ServiceResponse.error(
          'Payment was cancelled or not found',
          'Transaction was cancelled or does not exist on Flutterwave',
        );
      }

      throw new BadRequestException(
        error?.response?.data?.message ||
          'Failed to verify payment with Flutterwave',
      );
    }

    // Check if Flutterwave API call was successful
    if (flwResponse.data.status !== 'success') {
      // Payment not found or failed on Flutterwave
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      return ServiceResponse.error(
        'Payment verification failed',
        flwResponse.data.message || 'Payment not found or was cancelled',
      );
    }

    const transaction = flwResponse.data.data;
    if (
      transaction.status === 'successful' &&
      transaction.amount !== payment.amount
    ) {
      return ServiceResponse.error(
        'Payment verification failed',
        'Payment amount does not match the expected amount',
      );

      // process refund here : TODO
    }

    await this.prisma.$transaction(async (tx) => {
      // update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS },
      });

      // Prepare update data for member
      const memberUpdateData: any = { hasContributed: true };

      // If member owed interest and it was paid in the correct round, reset interest flags
      if (
        payment.member.owesInterest &&
        payment.member.interestDueRound &&
        payment.member.interestDueRound === payment.member.pack.currentRound
      ) {
        memberUpdateData.owesInterest = false;
        memberUpdateData.interestAmount = null;
        memberUpdateData.interestDueRound = null;
      }

      // update pack member has contributed and reset interest if applicable
      await tx.packMember.update({
        where: { id: payment.memberId },
        data: memberUpdateData,
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

      // // Verify with Flutterwave Transfer API
      // const flwResponse = await firstValueFrom(
      //   this.httpService.get(
      //     `${this.configService.get('FLUTTERWAVE.BASE_URL')}/transfers/${txRef}`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${this.configService.get('FLUTTERWAVE.SECRET_KEY')}`,
      //       },
      //     },
      //   ),
      // );

      // if (flwResponse.data.status !== 'success') {
      //   handleServiceError(
      //     flwResponse.data.message || 'Failed to verify payout',
      //     ctx,
      //     this.logger,
      //   );
      // }

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

        await tx.packMember.updateMany({
          where: { packId: payment.member.packId },
          data: { hasContributed: false },
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
        orderBy: {
          createdAt: 'desc',
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

  // background process to check for pending payments and fail
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
