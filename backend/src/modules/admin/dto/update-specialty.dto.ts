import { IsString, IsOptional, IsInt, Min, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(200, { message: 'Название не должно превышать 200 символов' })
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
