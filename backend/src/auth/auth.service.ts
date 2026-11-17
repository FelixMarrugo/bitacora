import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password.util';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.usersRepository.count() > 0) {
      return;
    }

    const admin = this.usersRepository.create({
      firstName: 'Administrador',
      lastName: 'Sistema',
      username: 'admin',
      passwordHash: await hashPassword('123456'),
      active: true,
      role: 'admin'
    });
    await this.usersRepository.save(admin);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { username: loginDto.username.trim() },
      select: ['id', 'firstName', 'lastName', 'username', 'active', 'role', 'passwordHash']
    });
    if (!user || !user.active || !await verifyPassword(loginDto.password, user.passwordHash)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: publicUser
    };
  }
}
