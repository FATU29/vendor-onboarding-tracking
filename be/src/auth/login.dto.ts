import { IsIn, IsString } from 'class-validator';
import { COORDINATOR_NAMES } from '../users/users.service';

export class LoginDto {
  @IsString()
  @IsIn(COORDINATOR_NAMES)
  name!: string;
}
