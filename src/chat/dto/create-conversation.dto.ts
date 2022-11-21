import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDTO {
  @IsNotEmpty()
  @ApiProperty()
  senderId: number;

  @IsNotEmpty()
  @ApiProperty()
  receiverId: number;

  @IsNotEmpty()
  @ApiProperty()
  message: string;
}
