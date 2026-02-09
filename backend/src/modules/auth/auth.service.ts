import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { TelegramCallbackPayload } from './telegram-auth.service';
import { UserRole } from '@prisma/client';

const BCRYPT_ROUNDS = 10;
const TELEGRAM_EMAIL_PREFIX = 'telegram_';
const TELEGRAM_EMAIL_SUFFIX = '@telegram.placeholder';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: UserRole };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // TODO: в будущем добавить подтверждение регистрации по email (отправка письма, верификация по ссылке)
  // TODO: в будущем добавить сброс пароля (forgot password: запрос по email, ссылка для смены пароля)
  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже зарегистрирован');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email.toLowerCase().trim(),
        passwordHash,
      },
    });

    const role = registerDto.role;
    if (role === 'MENTOR' || role === 'MENTEE') {
      await this.prisma.profile.create({
        data: {
          userId: user.id,
          firstName: '',
          lastName: '',
          specialty: '',
          ...(role === 'MENTOR'
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
      });
    }

    return this.generateTokensAndUser(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.validateUser(
      loginDto.email.toLowerCase().trim(),
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return this.generateTokensAndUser(user);
  }

  async loginWithTelegram(payload: TelegramCallbackPayload): Promise<AuthResult> {
    const telegramId = BigInt(payload.id);
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (user) {
      return this.generateTokensAndUser(user);
    }
    const email = `${TELEGRAM_EMAIL_PREFIX}${payload.id}${TELEGRAM_EMAIL_SUFFIX}`;
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
    user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        telegramId,
      },
    });
    await this.prisma.notificationSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailEnabled: true,
        telegramChatId: payload.id,
      },
      update: { telegramChatId: payload.id },
    });
    return this.generateTokensAndUser(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Невалидный или истёкший refresh токен');
      }
      const user = await this.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Невалидный или истёкший refresh токен');
      }
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'access' },
        {
          secret: this.config.get<string>('jwt.secret') ?? 'default-secret',
          expiresIn: 900, // 15 minutes
        },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Невалидный или истёкший refresh токен');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || user.status !== 'ACTIVE') return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    return user;
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.status !== 'ACTIVE') return null;
    return user;
  }

  private async generateTokensAndUser(user: {
    id: string;
    email: string;
    role: UserRole;
  }): Promise<AuthResult> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      {
        secret: this.config.get<string>('jwt.secret') ?? 'default-secret',
        expiresIn: 900, // 15 minutes
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'refresh' },
      {
        secret: this.config.get<string>('jwt.refreshSecret') ?? 'default-refresh-secret',
        expiresIn: 604800, // 7 days
      },
    );
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
