import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { MailService } from '../notifications/mail.service';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly profilesService: ProfilesService,
  ) {}

  private async getMenteeIdOrForbid(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentee: true },
    });
    if (!profile?.mentee) {
      throw new ForbiddenException({
        message: 'Доступно только для пользователей с ролью «Менти»',
        error: 'FORBIDDEN_MENTEE',
      });
    }
    return profile.mentee.id;
  }

  private async getMentorIdOrForbid(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: true },
    });
    if (!profile?.mentor) {
      throw new ForbiddenException({
        message: 'Доступно только для пользователей с ролью «Ментор»',
        error: 'FORBIDDEN_MENTOR',
      });
    }
    return profile.mentor.id;
  }

  async create(userId: string, dto: CreateRequestDto) {
    const menteeId = await this.getMenteeIdOrForbid(userId);

    const mentor = await this.prisma.mentor.findUnique({
      where: { id: dto.mentorId },
      include: {
        profile: { include: { user: { select: { email: true } } } },
      },
    });
    if (!mentor) {
      throw new NotFoundException({ message: 'Ментор не найден', error: 'MENTOR_NOT_FOUND' });
    }
    if (!mentor.acceptsRequests) {
      throw new BadRequestException({
        message: 'Ментор сейчас не принимает заявки',
        error: 'MENTOR_NOT_ACCEPTING',
      });
    }

    const activeConnectionsCount = await this.prisma.connection.count({
      where: { mentorId: mentor.id, status: 'ACTIVE' },
    });
    if (activeConnectionsCount >= mentor.maxMentees) {
      throw new BadRequestException({
        message: 'У ментора достигнут лимит активных менти',
        error: 'LIMIT_REACHED',
      });
    }

    const existingSent = await this.prisma.request.findFirst({
      where: {
        menteeId,
        mentorId: dto.mentorId,
        status: RequestStatus.SENT,
      },
    });
    if (existingSent) {
      throw new ConflictException({
        message: 'Заявка уже отправлена',
        error: 'REQUEST_ALREADY_SENT',
      });
    }

    const messageTrimmed = dto.message.trim();
    const mentorEmail = (mentor.profile as { user?: { email: string } })?.user?.email;
    const request = await this.prisma.request.create({
      data: {
        menteeId,
        mentorId: dto.mentorId,
        message: messageTrimmed,
        status: RequestStatus.SENT,
      },
      include: {
        mentee: { include: { profile: true } },
        mentor: { include: { profile: true } },
      },
    });

    const mentorUserId = (request.mentor.profile as { userId?: string })?.userId;
    if (mentorEmail && mentorUserId) {
      this.profilesService.getEmailEnabledForUserId(mentorUserId).then((emailEnabled) => {
        if (emailEnabled) {
          this.mail.sendNewRequestNotification({
            toEmail: mentorEmail,
            menteeFirstName: request.mentee.profile.firstName,
            menteeLastName: request.mentee.profile.lastName,
            messagePreview: MailService.truncateMessage(messageTrimmed),
          });
        }
      });
    }

    return this.toRequestResponse(request);
  }

  async findIncoming(userId: string) {
    const mentorId = await this.getMentorIdOrForbid(userId);

    const list = await this.prisma.request.findMany({
      where: { mentorId },
      include: {
        mentee: {
          include: {
            profile: {
              select: { firstName: true, lastName: true, specialty: true },
            },
          },
        },
        connection: { select: { completedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r) => this.toRequestResponse(r));
  }

  async findOutgoing(userId: string) {
    const menteeId = await this.getMenteeIdOrForbid(userId);

    const list = await this.prisma.request.findMany({
      where: { menteeId },
      include: {
        mentor: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
        },
        connection: { select: { completedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r) => this.toRequestResponse(r));
  }

  async accept(userId: string, requestId: string) {
    const mentorId = await this.getMentorIdOrForbid(userId);

    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        mentee: { include: { profile: { include: { user: { select: { email: true } } } } } },
        mentor: { include: { profile: { select: { firstName: true, lastName: true, specialty: true } } } },
      },
    });

    if (!request || request.mentorId !== mentorId) {
      throw new NotFoundException({ message: 'Заявка не найдена', error: 'REQUEST_NOT_FOUND' });
    }
    if (request.status === RequestStatus.REJECTED) {
      throw new BadRequestException({
        message: 'Заявка уже обработана (отклонена)',
        error: 'REQUEST_ALREADY_PROCESSED',
      });
    }
    if (request.status === RequestStatus.ACCEPTED || request.status === RequestStatus.COMPLETED) {
      return this.toRequestResponse(request);
    }

    const activeCount = await this.prisma.connection.count({
      where: { mentorId, status: 'ACTIVE', completedAt: null },
    });
    if (activeCount >= request.mentor.maxMentees) {
      throw new BadRequestException({
        message: 'У ментора достигнут лимит активных менти',
        error: 'LIMIT_REACHED',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id: requestId },
        data: { status: RequestStatus.ACCEPTED },
      });
      await tx.connection.upsert({
        where: {
          mentorId_menteeId: { mentorId: request.mentorId, menteeId: request.menteeId },
        },
        create: {
          mentorId: request.mentorId,
          menteeId: request.menteeId,
          requestId: request.id,
          status: 'ACTIVE',
        },
        update: {
          status: 'ACTIVE',
          requestId: request.id,
          detachedAt: null,
          reason: null,
        },
      });
    });

    const updated = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        mentee: {
          include: {
            profile: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentor: { include: { profile: true } },
      },
    });

    if (!updated) throw new NotFoundException('Заявка не найдена');

    const profile = updated.mentee.profile as {
      userId: string;
      firstName: string;
      lastName: string;
      user?: { email: string };
    } | null;
    const menteeEmail = profile?.user?.email;
    const menteeUserId = profile?.userId;
    const mentorProfile = updated.mentor.profile as { firstName: string; lastName: string } | null;
    if (menteeEmail && menteeUserId && mentorProfile) {
      this.profilesService.getEmailEnabledForUserId(menteeUserId).then((emailEnabled) => {
        if (emailEnabled) {
          this.mail.sendRequestDecisionNotification({
            toEmail: menteeEmail,
            accepted: true,
            mentorFirstName: mentorProfile.firstName,
            mentorLastName: mentorProfile.lastName,
          });
        }
      });
    }

    const response = this.toRequestResponse(updated);
    return {
      ...response,
      menteeContact:
        profile?.user?.email != null
          ? {
              email: profile.user.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
            }
          : undefined,
    };
  }

  async reject(userId: string, requestId: string) {
    const mentorId = await this.getMentorIdOrForbid(userId);

    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        mentee: {
          include: {
            profile: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                specialty: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentor: { include: { profile: { select: { firstName: true, lastName: true, specialty: true } } } },
      },
    });

    if (!request || request.mentorId !== mentorId) {
      throw new NotFoundException({ message: 'Заявка не найдена', error: 'REQUEST_NOT_FOUND' });
    }
    if (request.status !== RequestStatus.SENT) {
      return this.toRequestResponse(request);
    }

    const updated = await this.prisma.request.update({
      where: { id: requestId },
      data: { status: RequestStatus.REJECTED },
      include: {
        mentee: {
          include: {
            profile: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                specialty: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        mentor: { include: { profile: { select: { firstName: true, lastName: true, specialty: true } } } },
      },
    });

    const menteeProfile = updated.mentee.profile as { userId: string; user?: { email: string } } | null;
    const mentorProfile = updated.mentor.profile as { firstName: string; lastName: string } | null;
    const menteeEmail = menteeProfile?.user?.email;
    const menteeUserId = menteeProfile?.userId;
    if (menteeEmail && menteeUserId && mentorProfile) {
      this.profilesService.getEmailEnabledForUserId(menteeUserId).then((emailEnabled) => {
        if (emailEnabled) {
          this.mail.sendRequestDecisionNotification({
            toEmail: menteeEmail,
            accepted: false,
            mentorFirstName: mentorProfile.firstName,
            mentorLastName: mentorProfile.lastName,
          });
        }
      });
    }

    return this.toRequestResponse(updated);
  }

  private toRequestResponse(request: {
    id: string;
    menteeId: string;
    mentorId: string;
    message: string;
    status: RequestStatus;
    createdAt: Date;
    updatedAt: Date;
    mentee?: {
      profile: { firstName?: string; lastName?: string; specialty?: string };
      goal?: string;
    };
    mentor?: { profile: { firstName?: string; lastName?: string; specialty?: string } };
    connection?: { completedAt: Date | null } | null;
  }) {
    return {
      id: request.id,
      menteeId: request.menteeId,
      mentorId: request.mentorId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      completedAt: request.connection?.completedAt ?? undefined,
      mentee: request.mentee
        ? {
            id: request.menteeId,
            profile: request.mentee.profile,
            goal: request.mentee.goal,
          }
        : undefined,
      mentor: request.mentor
        ? {
            id: request.mentorId,
            profile: request.mentor.profile,
          }
        : undefined,
    };
  }
}
