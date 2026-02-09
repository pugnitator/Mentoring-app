import { Controller, Get, Put, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { AvatarDto } from './dto/avatar.dto';
import { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; role?: string };
}

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const profile = await this.profilesService.findMyProfile(req.user.id);
    if (!profile) {
      // Админ без профиля — возвращаем только роль, чтобы фронт не вёл на выбор ментор/менти
      if (req.user.role === 'ADMIN') {
        return { user: { role: 'ADMIN' as const } };
      }
      return null;
    }
    return profile;
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateMyProfile(req.user.id, dto);
  }

  @Post('me/role')
  async setMyRole(@Req() req: RequestWithUser, @Body() dto: SetRoleDto) {
    return this.profilesService.setMyRole(req.user.id, dto);
  }

  @Post('me/avatar')
  async setMyAvatar(@Req() req: RequestWithUser, @Body() dto: AvatarDto) {
    return this.profilesService.setMyAvatar(req.user.id, dto.avatar);
  }

  @Get('me/notification-settings')
  async getNotificationSettings(@Req() req: RequestWithUser) {
    return this.profilesService.getNotificationSettings(req.user.id);
  }

  @Patch('me/notification-settings')
  async updateNotificationSettings(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.profilesService.updateNotificationSettings(req.user.id, dto);
  }
}
