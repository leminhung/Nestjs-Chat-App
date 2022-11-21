import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORMCONFIG } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    TypeOrmModule.forRoot(TYPEORMCONFIG),
    UserModule,
    UploadModule,
  ],
})
export class AppModule {}
