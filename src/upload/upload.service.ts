import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UploadService {
  constructor(private userService: UserService) {}

  async uploadedFile(file: any, user: User) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };

    user.avatar = file.filename;
    await this.userService.saveUser(user);

    return response;
  }
}
