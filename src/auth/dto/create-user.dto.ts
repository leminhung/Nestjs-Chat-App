import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ name: 'Cameroon' })
  country: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
