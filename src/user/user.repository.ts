import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { FilterUserDTO } from './dto/filter-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUsers(filter: FilterUserDTO): Promise<User[]> {
    const query = this.createQueryBuilder('users');
    if (filter !== null) {
      if (filter.search) {
        query.andWhere('(username LIKE :search OR email LIKE :search) ', {
          search: '%' + filter.search + '%',
        });
      }
      if (filter.page) {
        if (filter.limit) {
          query.skip(filter.limit * (filter.page - 1));
        } else {
          query.skip(15 * (filter.page - 1));
        }
      }
      if (filter.limit) {
        query.limit(filter.limit);
      }
    }

    return await query.getMany();
  }
}
