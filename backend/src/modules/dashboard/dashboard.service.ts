import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

const PENDING_REQUESTS_LIMIT = 10;
const ACTIVE_CONNECTIONS_LIMIT = 10;
const COMPLETED_LIMIT = 10;
const MESSAGE_PREVIEW_LEN = 120;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { mentor: true, mentee: true },
    });

    const mentorId = profile?.mentor?.id ?? null;
    const menteeId = profile?.mentee?.id ?? null;

    if (!mentorId && !menteeId) {
      throw new ForbiddenException({
        message: 'Дашборд доступен только пользователям с ролью Ментор или Менти',
        error: 'DASHBOARD_FORBIDDEN',
      });
    }

    if (mentorId) {
      return this.getMentorDashboard(mentorId);
    }
    return this.getMenteeDashboard(menteeId!);
  }

  private truncateMessage(msg: string, max = MESSAGE_PREVIEW_LEN): string {
    const t = msg.trim();
    return t.length <= max ? t : t.slice(0, max) + '…';
  }

  private async getMentorDashboard(mentorId: string) {
    const [pendingRequests, activeConnections, completedConnections, pendingCount, activeCount, completedCount] =
      await Promise.all([
        this.prisma.request.findMany({
          where: { mentorId, status: 'SENT' },
          orderBy: { createdAt: 'desc' },
          take: PENDING_REQUESTS_LIMIT,
          include: {
            mentee: {
              include: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        this.prisma.connection.findMany({
          where: { mentorId, status: 'ACTIVE', completedAt: null },
          orderBy: { createdAt: 'desc' },
          take: ACTIVE_CONNECTIONS_LIMIT,
          include: {
            mentee: {
              include: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        this.prisma.connection.findMany({
          where: { mentorId, completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          take: COMPLETED_LIMIT,
          include: {
            mentee: {
              include: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        this.prisma.request.count({ where: { mentorId, status: 'SENT' } }),
        this.prisma.connection.count({
          where: { mentorId, status: 'ACTIVE', completedAt: null },
        }),
        this.prisma.connection.count({
          where: { mentorId, completedAt: { not: null } },
        }),
      ]);

    return {
      role: 'MENTOR' as const,
      summary: {
        pendingRequestsCount: pendingCount,
        activeConnectionsCount: activeCount,
        completedMentorshipsCount: completedCount,
      },
      widgets: {
        pendingRequests: pendingRequests.map((r) => ({
          id: r.id,
          status: r.status,
          createdAt: r.createdAt,
          messagePreview: this.truncateMessage(r.message),
          mentee: {
            id: r.menteeId,
            firstName: r.mentee.profile.firstName,
            lastName: r.mentee.profile.lastName,
            goal: r.mentee.goal ?? undefined,
          },
        })),
        activeConnections: activeConnections.map((c) => ({
          id: c.id,
          requestId: c.requestId,
          status: c.status,
          createdAt: c.createdAt,
          completedAt: c.completedAt,
          otherParty: {
            firstName: c.mentee.profile.firstName,
            lastName: c.mentee.profile.lastName,
          },
        })),
        completedMentorships: completedConnections.map((c) => ({
          id: c.id,
          requestId: c.requestId,
          status: c.status,
          completedAt: c.completedAt!,
          detachedAt: c.detachedAt,
          otherParty: {
            firstName: c.mentee.profile.firstName,
            lastName: c.mentee.profile.lastName,
          },
        })),
      },
    };
  }

  private async getMenteeDashboard(menteeId: string) {
    const [pendingRequests, activeConnections, completedConnections, pendingCount, activeCount, completedCount] =
      await Promise.all([
        this.prisma.request.findMany({
          where: { menteeId, status: 'SENT' },
          orderBy: { createdAt: 'desc' },
          take: PENDING_REQUESTS_LIMIT,
          include: {
            mentor: {
              include: {
                profile: { select: { firstName: true, lastName: true, specialty: true } },
              },
            },
          },
        }),
        this.prisma.connection.findMany({
          where: { menteeId, status: 'ACTIVE', completedAt: null },
          orderBy: { createdAt: 'desc' },
          take: ACTIVE_CONNECTIONS_LIMIT,
          include: {
            mentor: {
              include: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        this.prisma.connection.findMany({
          where: { menteeId, completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          take: COMPLETED_LIMIT,
          include: {
            mentor: {
              include: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        this.prisma.request.count({ where: { menteeId, status: 'SENT' } }),
        this.prisma.connection.count({
          where: { menteeId, status: 'ACTIVE', completedAt: null },
        }),
        this.prisma.connection.count({
          where: { menteeId, completedAt: { not: null } },
        }),
      ]);

    return {
      role: 'MENTEE' as const,
      summary: {
        pendingRequestsCount: pendingCount,
        activeConnectionsCount: activeCount,
        completedMentorshipsCount: completedCount,
      },
      widgets: {
        pendingRequests: pendingRequests.map((r) => ({
          id: r.id,
          status: r.status,
          createdAt: r.createdAt,
          messagePreview: this.truncateMessage(r.message),
          mentor: {
            id: r.mentorId,
            firstName: r.mentor.profile.firstName,
            lastName: r.mentor.profile.lastName,
            specialty: r.mentor.profile.specialty ?? undefined,
          },
        })),
        activeConnections: activeConnections.map((c) => ({
          id: c.id,
          requestId: c.requestId,
          status: c.status,
          createdAt: c.createdAt,
          completedAt: c.completedAt,
          otherParty: {
            firstName: c.mentor.profile.firstName,
            lastName: c.mentor.profile.lastName,
          },
        })),
        completedMentorships: completedConnections.map((c) => ({
          id: c.id,
          requestId: c.requestId,
          status: c.status,
          completedAt: c.completedAt!,
          detachedAt: c.detachedAt,
          otherParty: {
            firstName: c.mentor.profile.firstName,
            lastName: c.mentor.profile.lastName,
          },
        })),
      },
    };
  }
}
