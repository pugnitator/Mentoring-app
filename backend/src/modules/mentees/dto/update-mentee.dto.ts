import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum SearchStatus {
  SEARCHING = 'SEARCHING',
  NOT_SEARCHING = 'NOT_SEARCHING',
}

export class UpdateMenteeDto {
  @IsString({ message: 'Цель или проблема должна быть указана' })
  @MinLength(1, { message: 'Цель или проблема поиска ментора обязательна' })
  @MaxLength(2000)
  goal: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desiredPosition?: string;

  @IsEnum(SearchStatus, { message: 'Статус поиска должен быть SEARCHING или NOT_SEARCHING' })
  searchStatus: SearchStatus;
}
