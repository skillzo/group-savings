import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/login.dto';
import { ServiceResponse } from 'src/common/serviceResponse1';
import { handleServiceError } from 'src/util/error-handler.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const ctx = 'AuthService.login';

    try {
      // Find user by phone number
      const user = await this.prisma.user.findFirst({
        where: {
          phone: loginDto.phone,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid phone number');
      }

      // Generate JWT token with userId
      const payload = { userId: user.id };
      const token = this.jwtService.sign(payload);

      this.logger.log(`User logged in: ${user.id} (${user.phone})`);

      return ServiceResponse.success('Login successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async signup(signupDto: SignupDto) {
    const ctx = 'AuthService.signup';

    try {
      const phoneExist = await this.prisma.user.findFirst({
        where: {
          phone: signupDto.phone,
        },
      });

      const emailExist = await this.prisma.user.findUnique({
        where: {
          email: signupDto.email,
        },
      });

      if (phoneExist || emailExist) {
        throw new BadRequestException('Phone number already exists');
      }

      const createdUser = await this.prisma.user.create({
        data: signupDto,
      });

      const loginResponse = await this.login({ phone: createdUser.phone! });

      return ServiceResponse.success('Signup successful', loginResponse.data);
    } catch (error) {
      handleServiceError(error, ctx, this.logger);
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
