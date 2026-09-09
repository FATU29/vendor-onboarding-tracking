import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('coordinators')
  coordinators() {
    return this.usersService.findAll();
  }

  @Post('login')
  async login(@Body() { name }: LoginDto) {
    const user = (await this.usersService.findAll()).find((candidate) => candidate.name === name);
    if (!user) throw new UnauthorizedException('Coordinator account is unavailable.');
    return { id: user.id, name: user.name, token: this.authService.createSession(user) };
  }
}
