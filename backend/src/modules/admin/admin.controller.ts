import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tags')
  getTags() {
    return this.adminService.getTags();
  }

  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  createTag(@Body() dto: CreateTagDto) {
    return this.adminService.createTag(dto);
  }

  @Patch('tags/:id')
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.adminService.updateTag(id, dto);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTag(@Param('id') id: string) {
    await this.adminService.deleteTag(id);
  }

  @Get('specialties')
  getSpecialties() {
    return this.adminService.getSpecialties();
  }

  @Post('specialties')
  @HttpCode(HttpStatus.CREATED)
  createSpecialty(@Body() dto: CreateSpecialtyDto) {
    return this.adminService.createSpecialty(dto);
  }

  @Patch('specialties/:id')
  updateSpecialty(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.adminService.updateSpecialty(id, dto);
  }

  @Delete('specialties/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialty(@Param('id') id: string) {
    await this.adminService.deleteSpecialty(id);
  }

  @Get('users')
  getUsers(@Query() query: UsersQueryDto) {
    return this.adminService.getUsers(query);
  }
}
