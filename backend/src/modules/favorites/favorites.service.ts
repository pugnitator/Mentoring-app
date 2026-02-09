import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMenteeIdOrForbid(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentee: true },
    });
    if (!profile?.mentee) {
      throw new ForbiddenException(
        'Доступно только для пользователей с ролью «Менти»',
      );
    }
    return profile.mentee.id;
  }

  async add(userId: string, mentorId: string) {
    const menteeId = await this.getMenteeIdOrForbid(userId);

    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      select: { id: true },
    });
    if (!mentor) {
      throw new NotFoundException('Ментор не найден');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        menteeId_mentorId: { menteeId, mentorId },
      },
    });
    if (existing) {
      return { favorite: existing, created: false };
    }

    const favorite = await this.prisma.favorite.create({
      data: { menteeId, mentorId },
    });
    return { favorite, created: true };
  }

  async remove(userId: string, mentorId: string): Promise<void> {
    const menteeId = await this.getMenteeIdOrForbid(userId);

    await this.prisma.favorite.deleteMany({
      where: {
        menteeId,
        mentorId,
      },
    });
  }

  async findAllByMentee(userId: string) {
    const menteeId = await this.getMenteeIdOrForbid(userId);

    const favorites = await this.prisma.favorite.findMany({
      where: { menteeId },
      include: {
        mentor: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mentorIds = favorites.map((f) => f.mentor.id);
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

    return favorites.map((f) => {
      const m = f.mentor;
      return {
        id: m.id,
        firstName: m.profile.firstName,
        lastName: m.profile.lastName,
        createdAt: m.profile.createdAt,
        specialty: m.profile.specialty,
        acceptsRequests: m.acceptsRequests,
        tags: m.mentorTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name })),
        favoritesCount: countMap.get(m.id) ?? 0,
      };
    });
  }
}
