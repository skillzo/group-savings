import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceResponse } from 'src/common/serviceResponse1';
import { handleServiceError } from 'src/util/error-handler.util';

@Injectable()
export class ParksService {
  private readonly logger = new Logger(ParksService.name);
  private readonly packSelect = {
    id: true,
    name: true,
    contribution: true,
    targetAmount: true,
    totalMembers: true,
    currentRound: true,
    status: true,
    createdAt: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async createPack(createParkDto: CreateParkDto) {
    const ctx = 'ParksService.createPack';
    try {
      const contributionIsValid =
        createParkDto.contribution * createParkDto.totalMembers >=
        createParkDto.targetAmount;

      if (!Boolean(contributionIsValid)) {
        throw new BadRequestException(
          'Contribution is not valid. Contribution * Total Members must be equal to target Amount',
        );
      }

      const packAlreadyExists = await this.prisma.pack.findFirst({
        where: { name: { equals: createParkDto.name, mode: 'insensitive' } },
      });
      if (packAlreadyExists) {
        throw new BadRequestException('Pack already exists');
      }

      const pack = await this.prisma.pack.create({
        data: createParkDto,
        select: this.packSelect,
      });

      return ServiceResponse.success('Pack created successfully', pack);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getAllPacks() {
    const ctx = 'ParksService.getAllPacks';
    try {
      const packs = await this.prisma.pack.findMany({
        select: { ...this.packSelect, _count: { select: { members: true } } },
      });

      const tPacks = packs.map(({ _count, ...pack }) => ({
        ...pack,
        totalMembers: _count.members,
      }));

      return ServiceResponse.success('Packs fetched successfully', tPacks);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getPackById(id: string) {
    const ctx = 'ParksService.getPackById';
    try {
      const pack = await this.prisma.pack.findUnique({
        where: { id },
        select: this.packSelect,
      });
      return ServiceResponse.success('Pack fetched successfully', pack);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async addPackMember(id: string, email: string) {
    const ctx = 'ParksService.addPackMember';
    try {
      const pack = await this.prisma.pack.findUnique({
        where: { id },
      });
      if (!pack) {
        throw new NotFoundException('Pack not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userAlreadyInPack = await this.prisma.packMember.findFirst({
        where: { packId: id, userId: user.id },
      });
      if (userAlreadyInPack) {
        throw new BadRequestException('User already in pack');
      }

      const memberCount = await this.prisma.packMember.count({
        where: { packId: id },
      });
      if (memberCount >= pack.totalMembers) {
        throw new BadRequestException('Pack is full');
      }
      const order = memberCount + 1;

      const member = await this.prisma.packMember.create({
        data: { packId: id, userId: user.id, order: order },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return ServiceResponse.success('Member added successfully', member);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async removePackMember(packId: string, userId: string) {
    const ctx = 'ParksService.removePackMember';
    try {
      const memberToRemove = await this.prisma.packMember.findFirst({
        where: { packId, userId },
      });

      if (!memberToRemove) {
        throw new NotFoundException('Member not found');
      }

      const removedOrder = memberToRemove.order;

      // Use transaction to ensure atomicity
      await this.prisma.$transaction(async (tx) => {
        // Delete the member
        await tx.packMember.delete({
          where: { id: memberToRemove.id },
        });

        // Recalculate orders: decrement all members with order > removedOrder
        await tx.packMember.updateMany({
          where: {
            packId: packId,
            order: { gt: removedOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      });

      return ServiceResponse.success('Member removed successfully', undefined);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async getPackMembers(id: string) {
    const ctx = 'ParksService.getPackMembers';
    try {
      const members = await this.prisma.packMember.findMany({
        where: { packId: id },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          order: true,
          hasReceived: true,
          joinedAt: true,
        },
      });
      return ServiceResponse.success('Members fetched successfully', members);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }
}
