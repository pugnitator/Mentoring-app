import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(200, { message: 'Название не должно превышать 200 символов' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Описание не должно превышать 1000 символов' })
  description?: string;
}
