import { IsString, IsOptional, MaxLength } from 'class-validator';

const REASON_MAX = 500;

export class DetachDto {
  @IsOptional()
  @IsString({ message: 'Причина должна быть строкой' })
  @MaxLength(REASON_MAX, {
    message: `Причина не должна превышать ${REASON_MAX} символов`,
  })
  reason?: string;
}
