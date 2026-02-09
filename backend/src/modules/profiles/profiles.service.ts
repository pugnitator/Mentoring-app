import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetRoleDto, PlatformRole } from './dto/set-role.dto';
import { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';
import { ProfileLevel } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { role: true } },
        mentor: { include: { mentorTags: { include: { tag: true } } } },
        mentee: true,
      },
    });
    return this.mapProfileMentorTags(profile);
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Профиль не найден. Сначала выберите роль.');
    }
    const level = dto.level as ProfileLevel | undefined;
    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        middleName: dto.middleName?.trim() ?? null,
        specialty: dto.specialty.trim(),
        level: level ?? null,
        bio: dto.bio?.trim() ?? null,
        city: dto.city?.trim() ?? null,
      },
      include: {
        mentor: { include: { mentorTags: { include: { tag: true } } } },
        mentee: true,
      },
    });
    return this.mapProfileMentorTags(updated);
  }

  async setMyRole(userId: string, dto: SetRoleDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: true, mentee: true },
    });
    if (existing?.mentor || existing?.mentee) {
      throw new ConflictException('Роль уже выбрана. В MVP смена роли недоступна.');
    }

    if (!existing) {
      const created = await this.prisma.profile.create({
        data: {
          userId,
          firstName: '',
          lastName: '',
          specialty: '',
          ...(dto.role === PlatformRole.MENTOR
            ? {
                mentor: {
                  create: {
                    description: '',
                    workFormat: '',
                    acceptsRequests: false,
                    maxMentees: 0,
                    specializationTopics: [],
                  },
                },
              }
            : {
                mentee: {
                  create: {
                    goal: '',
                    searchStatus: 'SEARCHING',
                  },
                },
              }),
        },
        include: {
          mentor: { include: { mentorTags: { include: { tag: true } } } },
          mentee: true,
        },
      });
      return this.mapProfileMentorTags(created);
    }

    if (dto.role === PlatformRole.MENTOR) {
      await this.prisma.mentor.create({
        data: {
          profileId: existing.id,
          description: '',
          workFormat: '',
          acceptsRequests: false,
          maxMentees: 0,
          specializationTopics: [],
        },
      });
    } else {
      await this.prisma.mentee.create({
        data: {
          profileId: existing.id,
          goal: '',
          searchStatus: 'SEARCHING',
        },
      });
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        mentor: { include: { mentorTags: { include: { tag: true } } } },
        mentee: true,
      },
    });
    return this.mapProfileMentorTags(profile);
  }

  async setMyAvatar(userId: string, avatarDataUrl: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Профиль не найден. Сначала выберите роль.');
    }
    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl: avatarDataUrl },
      include: {
        mentor: { include: { mentorTags: { include: { tag: true } } } },
        mentee: true,
      },
    });
    return this.mapProfileMentorTags(updated);
  }

  async getNotificationSettings(userId: string): Promise<{ emailEnabled: boolean }> {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { userId, emailEnabled: true },
      });
    }
    return { emailEnabled: settings.emailEnabled };
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<{ emailEnabled: boolean }> {
    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId },
      create: { userId, emailEnabled: dto.emailEnabled },
      update: { emailEnabled: dto.emailEnabled },
    });
    return { emailEnabled: settings.emailEnabled };
  }

  /**
   * Для проверки перед отправкой писем. Если записи нет — true (отправлять).
   * При ошибке загрузки — false (не отправлять).
   */
  async getEmailEnabledForUserId(userId: string): Promise<boolean> {
    try {
      const settings = await this.prisma.notificationSettings.findUnique({
        where: { userId },
      });
      return settings?.emailEnabled ?? true;
    } catch {
      return false;
    }
  }

  private mapProfileMentorTags(profile: unknown): unknown {
    if (!profile || typeof profile !== 'object') return profile;
    const p = profile as { mentor?: { mentorTags?: { tag: { id: string; name: string } }[] }; [key: string]: unknown };
    if (p.mentor) {
      const mentor = p.mentor as { mentorTags?: { tag: { id: string; name: string } }[]; [key: string]: unknown };
      const tags = (mentor.mentorTags ?? []).map((mt) => ({ id: mt.tag.id, name: mt.tag.name }));
      (p as { mentor: unknown }).mentor = { ...mentor, tags, mentorTags: undefined, specializationTopics: undefined };
    }
    return profile;
  }
}
