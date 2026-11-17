import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../auth/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({
      order: { firstName: 'ASC', lastName: 'ASC', id: 'ASC' }
    });
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('No se encontró el usuario.');
    }
    return this.toPublicUser(user);
  }

  async create(dto: CreateUserDto) {
    const username = dto.username.trim();
    if (await this.usersRepository.findOneBy({ username })) {
      throw new ConflictException('Ese nombre de usuario ya está registrado.');
    }

    const user = this.usersRepository.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      username,
      passwordHash: await hashPassword(dto.password),
      active: dto.active ?? true,
      role: 'user'
    });
    return this.toPublicUser(await this.usersRepository.save(user));
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('No se encontró el usuario.');
    }

    if (dto.username) {
      const username = dto.username.trim();
      const existingUser = await this.usersRepository.findOneBy({ username });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ese nombre de usuario ya está registrado.');
      }
      user.username = username;
    }
    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName.trim();
    }
    if (dto.password) {
      user.passwordHash = await hashPassword(dto.password);
    }
    if (dto.active !== undefined) {
      user.active = dto.active;
    }

    return this.toPublicUser(await this.usersRepository.save(user));
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('No se encontró el usuario.');
    }
    return { deleted: true, id };
  }

  private toPublicUser({ passwordHash: _passwordHash, ...user }: User) {
    return user;
  }
}
