import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TYPEORMCONFIG: TypeOrmModuleOptions = {
  database: 'chat_app_server',
  host: 'localhost',
  username: 'root',
  port: 3306,
  type: 'mysql',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  password: '12345678',
};
