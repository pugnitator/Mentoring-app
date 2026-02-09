import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @IsUUID('4', { message: 'Укажите корректный id ментора (UUID)' })
  mentorId: string;
}
