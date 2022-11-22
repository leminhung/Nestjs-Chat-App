import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      dest: __dirname + '../../../static/users',
    }),
    AuthModule,
    UserModule,
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
