import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcriptjs from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  username: string;

  @Column()
  @ApiProperty()
  email: string;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  country: string;

  @Column()
  @ApiProperty()
  avatar: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Exclude()
  salt: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcriptjs.hash(password, this.salt);
    return hash === this.password;
  }

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}
