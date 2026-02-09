import { IsString, Matches, Length } from 'class-validator';

const MAX_BASE64_LENGTH = 700000; // ~500KB image in base64

export class AvatarDto {
  @IsString({ message: 'Аватар должен быть строкой (data URL base64)' })
  @Matches(/^data:image\/(jpeg|png|gif|webp);base64,/, {
    message: 'Допустимые форматы: JPEG, PNG, GIF, WebP (data URL с base64)',
  })
  @Length(0, MAX_BASE64_LENGTH, {
    message: 'Размер изображения не должен превышать 500 KB',
  })
  avatar: string;
}
