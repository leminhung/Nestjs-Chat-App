import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcriptjs from 'bcryptjs';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { FilterUserDTO } from './dto/filter-user.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private chatGateway: ChatGateway,
  ) {}

  async findOrCreateSocialUser(profile: any) {
    let user = await this.userRepository.findOne({
      where: {
        username: profile.displayName,
      },
    });
    if (!user) {
      const salt = await bcriptjs.genSalt();
      const password = await bcriptjs.hash(profile.id, salt);
      user = new User();
      user.username = profile.displayName;
      user.salt = salt;
      user.password = password;
      if (profile.emails[0]) {
        user.email = profile.emails[0].value;
      } else {
        throw new UnprocessableEntityException('User must Provide email');
      }
      this.saveUser(user);
    }
    return user;
  }

  async findUserbyEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async saveUser(user: User) {
    const usersaved: User = await this.userRepository.save(user);
    this.chatGateway.wss.emit('users/new', usersaved);
    return usersaved;
  }

  async findByUsernameOrEmail(username: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('users')
      .where('users.username= :username', { username })
      .orWhere('users.email= :username', { username })
      .getOne();
  }

  async getUsers(filter: FilterUserDTO): Promise<User[]> {
    return await this.userRepository.getUsers(filter);
  }
}
