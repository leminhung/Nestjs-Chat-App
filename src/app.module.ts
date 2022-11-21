import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORMCONFIG } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TYPEORMCONFIG),
    ChatModule,
    UploadModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
