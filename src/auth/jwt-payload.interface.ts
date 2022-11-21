import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  country: string;

  @ApiProperty({
    name: 'token issued Date',
  })
  iat: number;

  @ApiProperty({
    name: 'Token expiration Date',
  })
  exp: number;
}

export class JwtPayloadReponse {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  data: JwtPayload;
}
