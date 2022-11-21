import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationRepository } from './conversation.repository';
import { ConversationService } from './conversation.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationRepository]),
    AuthModule,
    forwardRef(() => UserModule),
  ],
  controllers: [ChatController],
  providers: [ConversationService, ChatGateway, JwtService, UserRepository],
  exports: [ChatGateway, AuthModule],
})
export class ChatModule {}
