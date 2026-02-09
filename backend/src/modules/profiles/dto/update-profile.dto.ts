import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum ProfileLevel {
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export class UpdateProfileDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(1, { message: 'Имя обязательно' })
  @MaxLength(100)
  firstName: string;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(1, { message: 'Фамилия обязательна' })
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsString({ message: 'Специальность должна быть указана' })
  @MinLength(1, { message: 'Специальность обязательна' })
  @MaxLength(200)
  specialty: string;

  @IsOptional()
  @IsEnum(ProfileLevel, { message: 'Недопустимое значение уровня' })
  level?: ProfileLevel;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}
