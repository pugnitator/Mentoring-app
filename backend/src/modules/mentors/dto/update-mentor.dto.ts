import {
  IsString,
  IsBoolean,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
  ArrayMinSize,
} from 'class-validator';

export class UpdateMentorDto {
  @IsString({ message: 'Описание услуг должно быть строкой' })
  @MinLength(1, { message: 'Описание услуг обязательно' })
  @MaxLength(3000)
  description: string;

  @IsString({ message: 'Формат работы должен быть указан' })
  @MinLength(1, { message: 'Формат работы обязателен' })
  @MaxLength(200)
  workFormat: string;

  @IsBoolean({ message: 'Укажите, принимаете ли заявки' })
  acceptsRequests: boolean;

  @ValidateIf((o) => o.acceptsRequests === false)
  @IsString()
  @MinLength(1, { message: 'Комментарий к статусу обязателен, если заявки не принимаются' })
  @MaxLength(500)
  statusComment?: string;

  @IsInt({ message: 'Максимальное количество менти должно быть целым числом' })
  @Min(0, { message: 'Минимум 0' })
  @Max(100, { message: 'Максимум 100' })
  maxMentees: number;

  @IsArray({ message: 'Укажите теги' })
  @ArrayMinSize(1, { message: 'Укажите хотя бы один тег' })
  @IsString({ each: true, message: 'Каждый тег — id (строка)' })
  tagIds: string[];
}
