import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MenteesService } from './mentees.service';
import { UpdateMenteeDto } from './dto/update-mentee.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('mentees')
@UseGuards(JwtAuthGuard)
export class MenteesController {
  constructor(private readonly menteesService: MenteesService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return this.menteesService.findMyMenteeProfile(req.user.id);
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateMenteeDto) {
    return this.menteesService.updateMyMenteeProfile(req.user.id, dto);
  }
}
