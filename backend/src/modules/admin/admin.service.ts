import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import type { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getSpecialtiesPublic() {
    return this.prisma.specialty.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, sortOrder: true },
    });
  }

  getTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, createdAt: true },
    });
  }

  async createTag(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { name: dto.name.trim() },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Тег с таким названием уже существует',
        error: 'TAG_NAME_EXISTS',
      });
    }
    return this.prisma.tag.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
      },
      select: { id: true, name: true, description: true, createdAt: true },
    });
  }

  async updateTag(id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException({ message: 'Тег не найден', error: 'TAG_NOT_FOUND' });
    }
    if (dto.name != null) {
      const existing = await this.prisma.tag.findUnique({
        where: { name: dto.name.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: 'Тег с таким названием уже существует',
          error: 'TAG_NAME_EXISTS',
        });
      }
    }
    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() ?? null }),
      },
      select: { id: true, name: true, description: true, createdAt: true },
    });
  }

  async deleteTag(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { mentorTags: true } } },
    });
    if (!tag) {
      throw new NotFoundException({ message: 'Тег не найден', error: 'TAG_NOT_FOUND' });
    }
    if (tag._count.mentorTags > 0) {
      throw new ConflictException({
        message: 'Невозможно удалить: тег привязан к менторам',
        error: 'TAG_IN_USE',
      });
    }
    await this.prisma.tag.delete({ where: { id } });
  }

  getSpecialties() {
    return this.prisma.specialty.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, sortOrder: true, createdAt: true },
    });
  }

  async createSpecialty(dto: CreateSpecialtyDto) {
    const name = dto.name.trim();
    const existing = await this.prisma.specialty.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException({
        message: 'Специальность с таким названием уже существует',
        error: 'SPECIALTY_NAME_EXISTS',
      });
    }
    return this.prisma.specialty.create({
      data: {
        name,
        sortOrder: dto.sortOrder ?? null,
      },
      select: { id: true, name: true, sortOrder: true, createdAt: true },
    });
  }

  async updateSpecialty(id: string, dto: UpdateSpecialtyDto) {
    const specialty = await this.prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new NotFoundException({
        message: 'Специальность не найдена',
        error: 'SPECIALTY_NOT_FOUND',
      });
    }
    if (dto.name != null) {
      const existing = await this.prisma.specialty.findUnique({
        where: { name: dto.name.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: 'Специальность с таким названием уже существует',
          error: 'SPECIALTY_NAME_EXISTS',
        });
      }
    }
    return this.prisma.specialty.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name.trim() }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder ?? null }),
      },
      select: { id: true, name: true, sortOrder: true, createdAt: true },
    });
  }

  async deleteSpecialty(id: string) {
    const specialty = await this.prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new NotFoundException({
        message: 'Специальность не найдена',
        error: 'SPECIALTY_NOT_FOUND',
      });
    }
    const inUse = await this.prisma.profile.count({
      where: { specialty: specialty.name },
    });
    if (inUse > 0) {
      throw new ConflictException({
        message: 'Невозможно удалить: специальность используется в профилях',
        error: 'SPECIALTY_IN_USE',
      });
    }
    await this.prisma.specialty.delete({ where: { id } });
  }

  async getUsers(query: UsersQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: {
      role?: UserRole;
      status?: UserStatus;
      email?: { contains: string; mode: 'insensitive' };
    } = {};
    if (query.role) where.role = query.role as UserRole;
    if (query.status) where.status = query.status as UserStatus;
    if (query.email?.trim()) {
      where.email = { contains: query.email.trim(), mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
              mentor: { select: { id: true } },
              mentee: { select: { id: true } },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        firstName: u.profile?.firstName ?? null,
        lastName: u.profile?.lastName ?? null,
        specialty: u.profile?.specialty ?? null,
        isMentor: !!u.profile?.mentor,
        isMentee: !!u.profile?.mentee,
      })),
      total,
      page,
      limit,
    };
  }
}
