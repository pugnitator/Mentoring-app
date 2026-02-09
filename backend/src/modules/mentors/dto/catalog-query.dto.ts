import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

function toBoolean(value: unknown): boolean {
  if (value === undefined || value === '') return true;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return true;
}

export class CatalogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  specialty?: string;

  /** Список id тегов через запятую (менторы с хотя бы одним из тегов) */
  @IsOptional()
  @IsString()
  tagIds?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  acceptsRequests?: boolean = true;
}
