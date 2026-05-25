import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
} as const;

const PRIVILEGED_ROLES: string[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        banned: true,
        isSuperAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateUserDto, callerRole: string) {
    const targetRole = dto.role ?? UserRole.USER;

    // super_admin is exclusively created by the seed — never via this API
    if (targetRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Super admin accounts cannot be created through this API');
    }

    // Normal admins cannot create other admin accounts
    if (callerRole === UserRole.ADMIN && PRIVILEGED_ROLES.includes(targetRole)) {
      throw new ForbiddenException('Admins can only create regular user accounts');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: targetRole,
        emailVerified: true,
      },
    });

    // Store credential in the better-auth Account table
    await this.prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const { ...safeUser } = user;
    return safeUser;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isSuperAdmin)
      throw new ForbiddenException('The super admin account cannot be deleted');

    // Cascade-delete sessions and accounts first
    await this.prisma.session.deleteMany({ where: { userId: id } });
    await this.prisma.account.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
  }
}
