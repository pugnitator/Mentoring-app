import { IsString, IsUUID, Length } from 'class-validator';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

export class CreateRequestDto {
  @IsUUID('4', { message: 'Укажите корректный идентификатор ментора' })
  mentorId: string;

  @IsString({ message: 'Сопроводительное письмо обязательно' })
  @Length(MESSAGE_MIN, MESSAGE_MAX, {
    message: `Сопроводительное письмо должно быть от ${MESSAGE_MIN} до ${MESSAGE_MAX} символов`,
  })
  message: string;
}
