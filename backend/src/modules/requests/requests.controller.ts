import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: RequestWithUser, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Get('incoming')
  async findIncoming(@Req() req: RequestWithUser) {
    return this.requestsService.findIncoming(req.user.id);
  }

  @Get('outgoing')
  async findOutgoing(@Req() req: RequestWithUser) {
    return this.requestsService.findOutgoing(req.user.id);
  }

  @Patch(':id/accept')
  async accept(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.requestsService.accept(req.user.id, id);
  }

  @Patch(':id/reject')
  async reject(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.requestsService.reject(req.user.id, id);
  }
}
