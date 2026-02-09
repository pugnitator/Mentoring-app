import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import type { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyMentorProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: { include: { mentorTags: { include: { tag: true } } } } },
    });
    if (!profile?.mentor) {
      throw new NotFoundException('Профиль ментора не найден. Выберите роль «Ментор».');
    }
    const mentor = profile.mentor;
    return this.toMentorWithTags(mentor);
  }

  async updateMyMentorProfile(userId: string, dto: UpdateMentorDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: true },
    });
    if (!profile?.mentor) {
      throw new NotFoundException('Профиль ментора не найден. Выберите роль «Ментор».');
    }
    if (!dto.acceptsRequests && (dto.statusComment == null || dto.statusComment.trim() === '')) {
      throw new BadRequestException(
        'Комментарий к статусу обязателен, когда заявки не принимаются',
      );
    }
    const tagIds = dto.tagIds?.filter(Boolean) ?? [];
    if (tagIds.length > 0) {
      const existing = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
        select: { id: true },
      });
      const foundIds = new Set(existing.map((t) => t.id));
      const missing = tagIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(`Теги не найдены: ${missing.join(', ')}`);
      }
    }
    await this.prisma.mentorTag.deleteMany({
      where: { mentorId: profile.mentor.id },
    });
    if (tagIds.length > 0) {
      await this.prisma.mentorTag.createMany({
        data: tagIds.map((tagId) => ({ mentorId: profile.mentor!.id, tagId })),
      });
    }
    return this.prisma.mentor.update({
      where: { profileId: profile.id },
      data: {
        description: dto.description.trim(),
        workFormat: dto.workFormat.trim(),
        acceptsRequests: dto.acceptsRequests,
        statusComment: dto.acceptsRequests ? null : (dto.statusComment?.trim() ?? null),
        maxMentees: dto.maxMentees,
      },
      include: { mentorTags: { include: { tag: true } } },
    }).then((m) => this.toMentorWithTags(m));
  }

  async findCatalog(params: CatalogQueryDto) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 12));
    const skip = (page - 1) * limit;
    const acceptsRequests = params.acceptsRequests ?? true;

    const tagIdList = params.tagIds
      ? params.tagIds.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const where: Prisma.MentorWhereInput = {
      acceptsRequests,
    };
    if (params.specialty?.trim()) {
      where.profile = { specialty: params.specialty.trim() };
    }
    if (tagIdList.length > 0) {
      where.mentorTags = {
        some: { tagId: { in: tagIdList } },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.mentor.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
              createdAt: true,
            },
          },
          mentorTags: { include: { tag: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mentor.count({ where }),
    ]);

    const mentorIds = items.map((m) => m.id);
    const favoritesRows =
      mentorIds.length > 0
        ? await this.prisma.favorite.findMany({
            where: { mentorId: { in: mentorIds } },
            select: { mentorId: true },
          })
        : [];
    const countMap = new Map<string, number>();
    for (const row of favoritesRows) {
      countMap.set(row.mentorId, (countMap.get(row.mentorId) ?? 0) + 1);
    }

    return {
      items: items.map((m) => ({
        id: m.id,
        firstName: m.profile.firstName,
        lastName: m.profile.lastName,
        createdAt: m.profile.createdAt,
        specialty: m.profile.specialty,
        acceptsRequests: m.acceptsRequests,
        tags: m.mentorTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name })),
        favoritesCount: countMap.get(m.id) ?? 0,
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            specialty: true,
            level: true,
            bio: true,
            city: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        mentorTags: { include: { tag: { select: { id: true, name: true } } } },
      },
    });
    if (!mentor) {
      throw new NotFoundException('Ментор не найден');
    }

    const favoritesCount = await this.prisma.favorite.count({
      where: { mentorId: mentor.id },
    });

    return {
      id: mentor.id,
      createdAt: mentor.createdAt,
      description: mentor.description,
      workFormat: mentor.workFormat,
      acceptsRequests: mentor.acceptsRequests,
      statusComment: mentor.statusComment,
      maxMentees: mentor.maxMentees,
      tags: mentor.mentorTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name })),
      profile: mentor.profile,
      favoritesCount,
    };
  }

  private toMentorWithTags(mentor: {
    id: string;
    profileId: string;
    description: string;
    workFormat: string;
    acceptsRequests: boolean;
    statusComment: string | null;
    maxMentees: number;
    specializationTopics?: string[];
    createdAt: Date;
    updatedAt: Date;
    mentorTags?: { tag: { id: string; name: string } }[];
  }) {
    const { mentorTags, specializationTopics: _skip, ...rest } = mentor;
    return {
      ...rest,
      tags: (mentorTags ?? []).map((mt) => ({ id: mt.tag.id, name: mt.tag.name })),
    };
  }
}
