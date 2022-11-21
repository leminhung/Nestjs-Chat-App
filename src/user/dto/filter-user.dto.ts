import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterUserDTO {
  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional()
  before?: Date;

  @ApiPropertyOptional()
  after?: Date;

  @ApiPropertyOptional()
  limit?: number;

  @ApiPropertyOptional()
  page?: number;
}
