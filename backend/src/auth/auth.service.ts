import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validateUser(username: string, password: string) {
    if (username === 'admin' && password === '123456') {
      return {
        id: 1,
        username,
        role: 'admin'
      };
    }

    return null;
  }

  login(loginDto: LoginDto) {
    const user = this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }
}
