import { Controller, Get, Put, Body, Req, UseGuards, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { MentorsService } from './mentors.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('mentors')
@UseGuards(JwtAuthGuard)
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return this.mentorsService.findMyMentorProfile(req.user.id);
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateMentorDto) {
    return this.mentorsService.updateMyMentorProfile(req.user.id, dto);
  }

  @Get()
  @Public()
  async getCatalog(@Query() query: CatalogQueryDto) {
    return this.mentorsService.findCatalog(query);
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string) {
    return this.mentorsService.findById(id);
  }
}
