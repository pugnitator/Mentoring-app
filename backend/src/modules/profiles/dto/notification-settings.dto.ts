import { IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsBoolean({ message: 'emailEnabled должно быть true или false' })
  emailEnabled: boolean;
}
