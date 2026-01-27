import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { PaymentRequestStatus } from '@prisma/client';
import { handleServiceError } from 'src/util/error-handler.util';
import { ServiceResponse } from 'src/common/serviceResponse1';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class PaymentRequestsService {
  private readonly logger = new Logger(PaymentRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(
    requestorId: string,
    createPaymentRequestDto: CreatePaymentRequestDto,
  ) {
    const ctx = 'PaymentRequestsService.create';

    try {
      const { payerId, packId } = createPaymentRequestDto;

      // Validate pack exists
      const pack = await this.prisma.pack.findUnique({
        where: { id: packId },
        include: {
          members: true,
        },
      });

      if (!pack) {
        throw new NotFoundException('Pack not found');
      }

      // Check if both users are members of the pack
      const requestorMember = pack.members.find(
        (m) => m.userId === requestorId && !m.deletedAt,
      );
      const payerMember = pack.members.find(
        (m) => m.userId === payerId && !m.deletedAt,
      );

      if (!requestorMember) {
        throw new BadRequestException(
          'You must be a member of this pack to create a payment request',
        );
      }

      if (!payerMember) {
        throw new BadRequestException(
          'The selected payer must be a member of this pack',
        );
      }

      if (requestorId === payerId) {
        throw new BadRequestException(
          'You cannot request payment from yourself',
        );
      }

      // Check if there's already a pending request for this pack
      const existingRequest = await this.prisma.paymentRequest.findFirst({
        where: {
          packId,
          requestorId,
          status: PaymentRequestStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new BadRequestException(
          'You already have a pending payment request for this pack',
        );
      }

      // Create the payment request
      const paymentRequest = await this.prisma.paymentRequest.create({
        data: {
          requestorId,
          payerId,
          packId,
          requestedAmount: pack.contribution,
          interestRate: 0.05, // 5%
          status: PaymentRequestStatus.PENDING,
        },
        include: {
          requestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pack: {
            select: {
              id: true,
              name: true,
              contribution: true,
              currentRound: true,
            },
          },
        },
      });

      this.logger.log(
        `Payment request created: ${paymentRequest.id} by ${requestorId} for pack ${packId}`,
      );

      return ServiceResponse.success('Payment request created successfully', {
        paymentRequest,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async accept(paymentRequestId: string, payerId: string) {
    const ctx = 'PaymentRequestsService.accept';

    try {
      const paymentRequest = await this.prisma.paymentRequest.findUnique({
        where: { id: paymentRequestId },
        include: {
          pack: true,
          requestor: true,
          payer: true,
        },
      });

      if (!paymentRequest) {
        throw new NotFoundException('Payment request not found');
      }

      if (paymentRequest.payerId !== payerId) {
        throw new BadRequestException(
          'You are not authorized to accept this payment request',
        );
      }

      if (paymentRequest.status !== PaymentRequestStatus.PENDING) {
        throw new BadRequestException(
          'This payment request has already been processed',
        );
      }

      // Get the requestor's pack member record
      const requestorMember = await this.prisma.packMember.findFirst({
        where: {
          userId: paymentRequest.requestorId,
          packId: paymentRequest.packId,
          deletedAt: null,
        },
      });

      if (!requestorMember) {
        throw new NotFoundException('Requestor member not found');
      }

      // Calculate interest amount
      const interestAmount = Math.round(
        paymentRequest.requestedAmount * paymentRequest.interestRate,
      );

      // Calculate the round when interest is due (next round)
      const interestDueRound = paymentRequest.pack.currentRound + 1;

      // Update payment request status and set interest tracking
      await this.prisma.$transaction(async (tx) => {
        // Update payment request status
        await tx.paymentRequest.update({
          where: { id: paymentRequestId },
          data: { status: PaymentRequestStatus.ACCEPTED },
        });

        // Set interest tracking on requestor's member record
        await tx.packMember.update({
          where: { id: requestorMember.id },
          data: {
            owesInterest: true,
            interestAmount,
            interestDueRound,
          },
        });
      });

      // Initiate actual payment through payments service
      // User B (payer) will pay for User A (requestor)
      const paymentResult = await this.paymentsService.initiateContributionForMember(
        requestorMember.id, // Member being paid for (User A)
        paymentRequest.payerId, // Payer's user ID (User B)
        paymentRequest.requestedAmount,
      );

      this.logger.log(
        `Payment request accepted: ${paymentRequestId} by ${payerId}, payment initiated`,
      );

      return ServiceResponse.success('Payment request accepted successfully', {
        paymentRequestId,
        interestAmount,
        interestDueRound,
        payment: paymentResult.data,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async reject(paymentRequestId: string, payerId: string) {
    const ctx = 'PaymentRequestsService.reject';

    try {
      const paymentRequest = await this.prisma.paymentRequest.findUnique({
        where: { id: paymentRequestId },
      });

      if (!paymentRequest) {
        throw new NotFoundException('Payment request not found');
      }

      if (paymentRequest.payerId !== payerId) {
        throw new BadRequestException(
          'You are not authorized to reject this payment request',
        );
      }

      if (paymentRequest.status !== PaymentRequestStatus.PENDING) {
        throw new BadRequestException(
          'This payment request has already been processed',
        );
      }

      await this.prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: PaymentRequestStatus.REJECTED },
      });

      this.logger.log(
        `Payment request rejected: ${paymentRequestId} by ${payerId}`,
      );

      return ServiceResponse.success('Payment request rejected successfully', {
        paymentRequestId,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async findByPack(packId: string) {
    const ctx = 'PaymentRequestsService.findByPack';

    try {
      const paymentRequest = await this.prisma.paymentRequest.findFirst({
        where: { packId },
        orderBy: { createdAt: 'desc' },
        include: {
          requestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return ServiceResponse.success('Payment request retrieved', {
        paymentRequest,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async findPendingByPayer(payerId: string) {
    const ctx = 'PaymentRequestsService.findPendingByPayer';

    try {
      const paymentRequests = await this.prisma.paymentRequest.findMany({
        where: {
          payerId,
          status: PaymentRequestStatus.PENDING,
        },
        include: {
          requestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pack: {
            select: {
              id: true,
              name: true,
              contribution: true,
              currentRound: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return ServiceResponse.success('Pending payment requests retrieved', {
        paymentRequests,
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }
}
