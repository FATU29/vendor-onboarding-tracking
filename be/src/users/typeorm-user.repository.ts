import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

/** TypeORM adapter for the user persistence port. */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  async upsertByName(name: string): Promise<void> {
    await this.repository.upsert({ name }, ['name']);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }
}
