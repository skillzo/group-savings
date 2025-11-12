import { Module } from '@nestjs/common';

import { ParksModule } from './parks/parks.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import ENV from './config/Env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ENV],
    }),

    ParksModule,
    UsersModule,
    PaymentsModule,
    WebhooksModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
