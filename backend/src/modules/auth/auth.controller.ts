import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { verifyTelegramAuth } from './telegram-auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout() {
    // MVP: токены не инвалидируются на сервере
    return;
  }

  @Public()
  @Get('telegram/callback')
  async telegramCallback(
    @Query()
    query: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL')?.replace(/\/$/, '') || 'http://localhost:5173';
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return res.redirect(`${frontendUrl}/login?error=telegram_not_configured`);
    }
    if (!verifyTelegramAuth(query, botToken)) {
      return res.redirect(`${frontendUrl}/login?error=telegram_auth_failed`);
    }
    try {
      const result = await this.authService.loginWithTelegram({
        id: query.id!,
        first_name: query.first_name,
        last_name: query.last_name,
        username: query.username,
        photo_url: query.photo_url,
        auth_date: query.auth_date!,
        hash: query.hash!,
      });
      const hash = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }).toString();
      return res.redirect(`${frontendUrl}/auth/telegram/complete#${hash}`);
    } catch {
      return res.redirect(`${frontendUrl}/login?error=telegram_login_failed`);
    }
  }

  // TODO: POST auth/forgot-password — запрос сброса пароля по email
  // TODO: POST auth/reset-password — установка нового пароля по токену из письма
}
