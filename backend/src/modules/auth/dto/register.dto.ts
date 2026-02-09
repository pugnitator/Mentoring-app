import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsEnum } from 'class-validator';

export const RegisterRole = {
  MENTOR: 'MENTOR',
  MENTEE: 'MENTEE',
} as const;
export type RegisterRoleType = (typeof RegisterRole)[keyof typeof RegisterRole];

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавные и строчные буквы, а также цифры',
  })
  password: string;

  @IsOptional()
  @IsEnum(RegisterRole, { message: 'Роль должна быть MENTOR или MENTEE' })
  role?: RegisterRoleType;
}
