import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AdminService } from './admin.service';

@Controller('specialties')
export class SpecialtiesPublicController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Public()
  getSpecialties() {
    return this.adminService.getSpecialtiesPublic();
  }
}
