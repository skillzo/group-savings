import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceResponse } from 'src/common/serviceResponse1';
import { Prisma } from '@prisma/client';
import {
  createPaginatedResponse,
  PaginatedResponse,
} from 'src/util/paginatedResponse.util';
import { ParksService } from 'src/parks/parks.service';
import { handleServiceError } from 'src/util/error-handler.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    accountNumber: true,
    accountName: true,
    createdAt: true,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly parksService: ParksService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const ctx = 'UsersService.createUser';
    try {
      const userExist = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (userExist) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.prisma.user.create({
        data: createUserDto,
        select: this.userSelect,
      });

      return ServiceResponse.success('User created successfully', user);
    } catch (error) {
      this.logger.error(`${ctx} - Failed to create user`, error);
      throw new InternalServerErrorException(`${ctx} - Failed to create user`);
    }
  }

  async getAllUsers(query: { page: string; pageSize: string; search: string }) {
    const ctx = 'UsersService.getAllUsers';
    try {
      const { page = 1, pageSize = 10, search } = query;
      const skip = (Number(page) - 1) * Number(pageSize);
      const take = Number(pageSize);
      const where: Prisma.UserWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc',
          },
          select: this.userSelect,
        }),

        this.prisma.user.count({
          where,
        }),
      ]);

      return ServiceResponse.success(
        'Users fetched successfully',
        createPaginatedResponse(users, total, skip, take),
      );
    } catch (error) {
      this.logger.error(`${ctx} - Failed to get all users`, error);
      throw new InternalServerErrorException(
        `${ctx} - Failed to get all users`,
      );
    }
  }

  async getUserById(id: string) {
    const ctx = 'UsersService.getUserById';
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: this.userSelect,
      });
      return ServiceResponse.success('User fetched successfully', user);
    } catch (error) {
      this.logger.error(`${ctx} - Failed to get user by id`, error);
      throw new InternalServerErrorException(
        `${ctx} - Failed to get user by id`,
      );
    }
  }

  async getUserPacks(id: string) {
    const ctx = 'UsersService.getUserPacks';
    try {
      const packs = await this.parksService.getUserPacks(id);

      if (packs.success) {
        return ServiceResponse.success(
          'User packs fetched successfully',
          packs.data,
        );
      }

      return ServiceResponse.error(packs.message);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }
}
