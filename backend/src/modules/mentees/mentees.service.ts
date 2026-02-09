import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateMenteeDto } from './dto/update-mentee.dto';
import { SearchStatus } from '@prisma/client';

@Injectable()
export class MenteesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyMenteeProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentee: true },
    });
    if (!profile?.mentee) {
      throw new NotFoundException('Профиль менти не найден. Выберите роль «Менти».');
    }
    return profile.mentee;
  }

  async updateMyMenteeProfile(userId: string, dto: UpdateMenteeDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentee: true },
    });
    if (!profile?.mentee) {
      throw new NotFoundException('Профиль менти не найден. Выберите роль «Менти».');
    }
    const searchStatus = dto.searchStatus as SearchStatus;
    return this.prisma.mentee.update({
      where: { profileId: profile.id },
      data: {
        goal: dto.goal.trim(),
        desiredPosition: dto.desiredPosition?.trim() ?? null,
        searchStatus,
      },
    });
  }
}
