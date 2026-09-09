import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRecord } from '../users/user.repository';

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, UserRecord>();

  createSession(user: UserRecord): string {
    const token = crypto.randomUUID();
    this.sessions.set(token, user);
    return token;
  }

  getUser(token?: string): UserRecord {
    const user = token ? this.sessions.get(token) : undefined;
    if (!user) {
      throw new UnauthorizedException('Please log in before updating a vendor.');
    }
    return user;
  }
}
