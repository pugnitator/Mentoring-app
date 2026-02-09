import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConnectionStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { MailService } from '../notifications/mail.service';
import { ProfilesService } from '../profiles/profiles.service';
import { DetachDto } from './dto/detach.dto';

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly profilesService: ProfilesService,
  ) {}

  /**
   * Возвращает mentorId и/или menteeId текущего пользователя. В MVP одна роль.
   */
  private async getMyMentorAndMenteeIds(userId: string): Promise<{
    mentorId: string | null;
    menteeId: string | null;
  }> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: true, mentee: true },
    });
    return {
      mentorId: profile?.mentor?.id ?? null,
      menteeId: profile?.mentee?.id ?? null,
    };
  }

  async findAllForCurrentUser(userId: string) {
    const { mentorId, menteeId } = await this.getMyMentorAndMenteeIds(userId);

    if (!mentorId && !menteeId) {
      return [];
    }

    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          ...(mentorId ? [{ mentorId }] : []),
          ...(menteeId ? [{ menteeId }] : []),
        ],
      },
      include: {
        mentor: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentee: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map((c) => this.toConnectionResponse(c, userId, mentorId, menteeId));
  }

  private toConnectionResponse(
    c: {
      id: string;
      mentorId: string;
      menteeId: string;
      requestId: string;
      status: ConnectionStatus;
      createdAt: Date;
      completedAt: Date | null;
      detachedAt: Date | null;
      reason: string | null;
      mentor: {
        profile: {
          firstName: string;
          lastName: string;
          user: { email: string } | null;
        };
      };
      mentee: {
        profile: {
          firstName: string;
          lastName: string;
          user: { email: string } | null;
        };
      };
    },
    currentUserId: string,
    myMentorId: string | null,
    myMenteeId: string | null,
  ) {
    const base = {
      id: c.id,
      mentorId: c.mentorId,
      menteeId: c.menteeId,
      requestId: c.requestId,
      status: c.status,
      createdAt: c.createdAt,
      completedAt: c.completedAt,
      detachedAt: c.detachedAt,
      reason: c.reason,
    };

    if (c.status !== 'ACTIVE') {
      return { ...base, contact: null };
    }

    const mentorProfile = c.mentor.profile as { firstName: string; lastName: string; user?: { email: string } | null };
    const menteeProfile = c.mentee.profile as { firstName: string; lastName: string; user?: { email: string } | null };

    if (myMentorId && c.mentorId === myMentorId) {
      return {
        ...base,
        contact: menteeProfile?.user?.email
          ? {
              email: menteeProfile.user.email,
              firstName: menteeProfile.firstName,
              lastName: menteeProfile.lastName,
            }
          : null,
      };
    }

    if (myMenteeId && c.menteeId === myMenteeId) {
      return {
        ...base,
        contact: mentorProfile?.user?.email
          ? {
              email: mentorProfile.user.email,
              firstName: mentorProfile.firstName,
              lastName: mentorProfile.lastName,
            }
          : null,
      };
    }

    return { ...base, contact: null };
  }

  async detach(userId: string, connectionId: string, dto: DetachDto) {
    const { mentorId, menteeId } = await this.getMyMentorAndMenteeIds(userId);

    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        mentor: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentee: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    if (!connection) {
      throw new NotFoundException({ message: 'Связь не найдена', error: 'CONNECTION_NOT_FOUND' });
    }

    const isParticipant =
      (mentorId && connection.mentorId === mentorId) ||
      (menteeId && connection.menteeId === menteeId);

    if (!isParticipant) {
      throw new NotFoundException({ message: 'Связь не найдена', error: 'CONNECTION_NOT_FOUND' });
    }

    if (connection.status === 'DETACHED') {
      throw new BadRequestException({
        message: 'Связь уже откреплена',
        error: 'ALREADY_DETACHED',
      });
    }

    const reasonTrimmed = dto.reason?.trim() ?? null;

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: 'DETACHED',
        detachedAt: new Date(),
        reason: reasonTrimmed,
      },
      include: {
        mentor: { include: { profile: true } },
        mentee: { include: { profile: true } },
      },
    });

    const mentorProfile = connection.mentor.profile as {
      userId: string;
      firstName: string;
      lastName: string;
      user?: { email: string } | null;
    };
    const menteeProfile = connection.mentee.profile as {
      userId: string;
      firstName: string;
      lastName: string;
      user?: { email: string } | null;
    };

    const iAmMentor = !!mentorId && connection.mentorId === mentorId;
    const recipientEmail = iAmMentor ? menteeProfile?.user?.email : mentorProfile?.user?.email;
    const recipientUserId = iAmMentor ? menteeProfile?.userId : mentorProfile?.userId;
    const otherFirstName = iAmMentor ? mentorProfile.firstName : menteeProfile.firstName;
    const otherLastName = iAmMentor ? mentorProfile.lastName : menteeProfile.lastName;

    if (recipientEmail && recipientUserId) {
      this.profilesService.getEmailEnabledForUserId(recipientUserId).then((emailEnabled) => {
        if (emailEnabled) {
          this.mail.sendDetachNotification({
            toEmail: recipientEmail,
            otherSideFirstName: otherFirstName,
            otherSideLastName: otherLastName,
            reason: reasonTrimmed,
          });
        }
      });
    }

    return {
      id: updated.id,
      mentorId: updated.mentorId,
      menteeId: updated.menteeId,
      requestId: updated.requestId,
      status: updated.status,
      createdAt: updated.createdAt,
      completedAt: updated.completedAt,
      detachedAt: updated.detachedAt,
      reason: updated.reason,
      contact: null,
    };
  }

  async complete(userId: string, connectionId: string) {
    const { mentorId, menteeId } = await this.getMyMentorAndMenteeIds(userId);

    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        request: true,
        mentor: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentee: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    if (!connection) {
      throw new NotFoundException({ message: 'Связь не найдена', error: 'CONNECTION_NOT_FOUND' });
    }

    const isParticipant =
      (mentorId && connection.mentorId === mentorId) ||
      (menteeId && connection.menteeId === menteeId);

    if (!isParticipant) {
      throw new NotFoundException({ message: 'Связь не найдена', error: 'CONNECTION_NOT_FOUND' });
    }

    if (connection.status !== 'ACTIVE') {
      throw new BadRequestException({
        message: 'Завершить можно только активную связь',
        error: 'CONNECTION_NOT_ACTIVE',
      });
    }

    if (connection.completedAt) {
      throw new BadRequestException({
        message: 'Менторство уже отмечено как завершённое',
        error: 'ALREADY_COMPLETED',
      });
    }

    const now = new Date();
    const [updated] = await this.prisma.$transaction([
      this.prisma.connection.update({
        where: { id: connectionId },
        data: { completedAt: now },
        include: {
          mentor: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  user: { select: { email: true } },
                },
              },
            },
          },
          mentee: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  user: { select: { email: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.request.update({
        where: { id: connection.requestId },
        data: { status: 'COMPLETED' },
      }),
    ]);

    return this.toConnectionResponse(updated, userId, mentorId, menteeId);
  }
}
