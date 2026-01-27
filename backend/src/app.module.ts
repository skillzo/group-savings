import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { ParksModule } from './parks/parks.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import ENV from './config/Env';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ENV],
    }),

    ParksModule,
    UsersModule,
    PaymentsModule,
    PaymentRequestsModule,
    WebhooksModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
