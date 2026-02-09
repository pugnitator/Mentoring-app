import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConnectionsService } from './connections.service';
import { DetachDto } from './dto/detach.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.connectionsService.findAllForCurrentUser(req.user.id);
  }

  @Patch(':id/complete')
  async complete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.connectionsService.complete(req.user.id, id);
  }

  @Post(':id/detach')
  async detach(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: DetachDto,
  ) {
    return this.connectionsService.detach(req.user.id, id, dto);
  }
}
