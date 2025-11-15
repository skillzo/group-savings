import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ParksService } from 'src/parks/parks.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ParksService],
})
export class UsersModule {}
