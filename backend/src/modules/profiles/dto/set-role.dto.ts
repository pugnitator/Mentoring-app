import { IsEnum } from 'class-validator';

export enum PlatformRole {
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
}

export class SetRoleDto {
  @IsEnum(PlatformRole, { message: 'Роль должна быть MENTOR или MENTEE' })
  role: PlatformRole;
}
