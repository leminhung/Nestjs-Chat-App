import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  content: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  senderId: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  receiverId: number;

  @Column({
    type: 'varchar',
    default: new Date().toString(),
  })
  @ApiProperty()
  createdAt: string;

  @Column({
    type: 'varchar',
    default: null,
  })
  @ApiProperty()
  readAt: string;

  // @Column({
  //   default: null,
  // })
  // deleted: boolean;
}
