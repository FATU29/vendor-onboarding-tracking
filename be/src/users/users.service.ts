import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from './user.repository';

export const COORDINATOR_NAMES = ['Linh', 'Huy', 'Mai'];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async onModuleInit(): Promise<void> {
    for (const name of COORDINATOR_NAMES) {
      await this.users.upsertByName(name);
    }
  }

  findAll() {
    return this.users.findAll();
  }

  findById(id: string) {
    return this.users.findById(id);
  }
}
