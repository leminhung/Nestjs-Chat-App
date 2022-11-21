import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), ChatModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
