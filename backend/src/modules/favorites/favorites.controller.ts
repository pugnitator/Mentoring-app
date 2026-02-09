import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import type { Request } from 'express';
import type { Response } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async add(@Req() req: RequestWithUser, @Body() dto: AddFavoriteDto, @Res() res: Response) {
    const { favorite, created } = await this.favoritesService.add(req.user.id, dto.mentorId);
    return res.status(created ? HttpStatus.CREATED : HttpStatus.OK).json(favorite);
  }

  @Delete(':mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: RequestWithUser,
    @Param('mentorId') mentorId: string,
  ): Promise<void> {
    await this.favoritesService.remove(req.user.id, mentorId);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.favoritesService.findAllByMentee(req.user.id);
  }
}
