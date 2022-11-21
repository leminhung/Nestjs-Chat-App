import { Controller, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';

@Controller('upload')
export class UploadController {
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFiles() file) {
    console.log(file);
  }
}
