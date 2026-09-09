import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { User } from './user.entity';
import { USER_REPOSITORY } from './user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    TypeOrmUserRepository,
    { provide: USER_REPOSITORY, useExisting: TypeOrmUserRepository },
    UsersService,
  ],
  exports: [USER_REPOSITORY, UsersService],
})
export class UsersModule {}
