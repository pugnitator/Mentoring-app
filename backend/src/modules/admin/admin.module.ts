import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SpecialtiesPublicController } from './specialties-public.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, SpecialtiesPublicController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
