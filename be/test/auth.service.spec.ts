import { describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { UserRecord } from '../src/users/user.repository';

describe('AuthService', () => {
  const user: UserRecord = { id: 'coordinator-1', name: 'Linh' };

  it('resolves the authenticated coordinator from a valid mock session', () => {
    const authService = new AuthService();
    const token = authService.createSession(user);

    expect(authService.getUser(token)).toEqual(user);
  });

  it('rejects a missing or invalid mock session', () => {
    const authService = new AuthService();

    expect(() => authService.getUser()).toThrow(UnauthorizedException);
    expect(() => authService.getUser('invalid-token')).toThrow(UnauthorizedException);
  });
});
