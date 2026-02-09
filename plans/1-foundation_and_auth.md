# Этап 1: Foundation & Authentication (UC-01, UC-02)

## Цель этапа
Реализовать базовую инфраструктуру приложения и систему аутентификации с регистрацией, логином и JWT токенами (access + refresh).

## Use Cases
- **UC-01:** Регистрация пользователя (email + пароль, валидация email, хеширование пароля)  
- **UC-02:** Авторизация (email + пароль, JWT access + refresh токены)

---

## Backend задачи

### 1.1. Prisma схема: модель User
**Файл:** `backend/prisma/schema.prisma`

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  role         UserRole   @default(USER)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
}
````

**Миграция:**

```
npx prisma migrate dev --name init_users
```

---

### 1.2. Конфигурация приложения

**Файлы:**

* `backend/src/config/database.config.ts` — настройка Prisma Client и экспорт PrismaService
* `backend/src/config/jwt.config.ts` — конфигурация JWT, переменные окружения:
  `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`

**Обновление AppModule:**

* Импорт `ConfigModule` с загрузкой `.env`
* Импорт `JwtModule` с конфигурацией
* Импорт `PassportModule`

---

### 1.3. Модуль Auth

**Структура:** `backend/src/modules/auth/`

#### 1.3.1. DTO для валидации

* `register.dto.ts`

```ts
export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавные и строчные буквы, а также цифры'
  })
  password: string;
}
```

* `login.dto.ts`

```ts
export class LoginDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}
```

* `refresh-token.dto.ts`

```ts
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh токен обязателен' })
  refreshToken: string;
}
```

#### 1.3.2. Сервис Auth

**Файл:** `auth.service.ts`
Методы:

* `register(registerDto: RegisterDto)` — регистрация нового пользователя
  Проверка email, хеширование пароля (bcrypt, 10 rounds), создание пользователя, генерация токенов
* `login(loginDto: LoginDto)` — авторизация
  Поиск пользователя, проверка пароля, генерация токенов
* `refresh(refreshToken: string)` — обновление access токена
* `validateUser(email: string, password: string)` — для Passport стратегии
* `validateUserById(userId: string)` — для JWT стратегии

**Зависимости:** PrismaService, JwtService, BcryptService

#### 1.3.3. Стратегии Passport

* `jwt.strategy.ts` — JWT стратегия для access токенов, используется в JwtAuthGuard
* `jwt-refresh.strategy.ts` — для refresh токенов (опционально)

#### 1.3.4. Guards

* `jwt-auth.guard.ts` — защита роутов, извлечение пользователя из request

#### 1.3.5. Контроллер Auth

**Файл:** `auth.controller.ts`
Endpoints:

| Метод | URL                            | Body            | Response                            | Статус         |
| ----- | ------------------------------ | --------------- | ----------------------------------- | -------------- |
| POST  | /api/auth/register             | RegisterDto     | { accessToken, refreshToken, user } | 201 Created    |
| POST  | /api/auth/login                | LoginDto        | { accessToken, refreshToken, user } | 200 OK         |
| POST  | /api/auth/refresh              | RefreshTokenDto | { accessToken }                     | 200 OK         |
| POST  | /api/auth/logout (опционально) | JWT токен       | —                                   | 204 No Content |

#### 1.3.6. Модуль Auth

**Файл:** `auth.module.ts`
Импорт `JwtModule`, `PassportModule`
Провайдеры: AuthService, JwtStrategy
Экспорт AuthService
Контроллер: AuthController

---

### 1.4. Общие компоненты

#### 1.4.1. Exception Filter

* `http-exception.filter.ts` — глобальный фильтр исключений, трансформация в единый формат:

```json
{
  "statusCode": number,
  "code": string,
  "message": string,
  "timestamp": string,
  "path": string
}
```

* Обработка ValidationPipe и Prisma ошибок
* Логирование ошибок
* Применение: `app.useGlobalFilters(new HttpExceptionFilter())`

#### 1.4.2. Validation Pipe

* В `main.ts`
* Опции: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

#### 1.4.3. Prisma Service

* `prisma.service.ts` — обёртка над PrismaClient, OnModuleInit/Destroy для подключения/отключения

---

### 1.5. Обновление main.ts

* Добавить глобальный ValidationPipe и ExceptionFilter
* Настроить CORS и глобальный префикс `/api`

---

## Frontend задачи

### 2.1. Настройка базовой инфраструктуры

#### 2.1.1. React Router

* `routes/index.tsx` — BrowserRouter, базовые маршруты: `/`, `/login`, `/register`, 404
* `ProtectedRoute.tsx` — защита маршрутов, проверка токена

#### 2.1.2. React Query

* `queryClient.ts` — QueryClient с `retry:1` и `refetchOnWindowFocus:false`
* `App.tsx` — обёртка QueryClientProvider и RouterProvider

#### 2.1.3. Axios клиент

* `axios.ts` — baseURL, interceptor для access токена, обработка 401
* `auth.ts` — функции getAccessToken, getRefreshToken, setTokens, clearTokens, isAuthenticated

#### 2.1.4. Типы TypeScript

* `types/auth.ts`

```ts
export interface User { id: string; email: string; role: 'USER' | 'ADMIN'; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: User; }
export interface RegisterData { email: string; password: string; }
export interface LoginData { email: string; password: string; }
```

---

### 2.2. Feature: Auth

#### 2.2.1. API hooks

* `authApi.ts` — register, login, refresh
* `useAuth.ts` — React Query мутации, сохранение токенов, редирект

#### 2.2.2. Компоненты форм

* `LoginForm.tsx`, `RegisterForm.tsx` — валидация, ошибки, кнопки

#### 2.2.3. Страницы

* `LoginPage.tsx`, `RegisterPage.tsx` — использование компонентов форм, редирект

#### 2.2.4. Контекст аутентификации (опционально)

* `AuthContext.tsx` — хранение состояния пользователя, функции login/logout

---

### 2.3. UI компоненты

* `Button.tsx`, `Input.tsx`, `ErrorMessage.tsx` — переиспользуемые элементы, Tailwind стили
* `AuthLayout.tsx` — layout для страниц авторизации

---

### 2.4. Обработка ошибок

* `errorHandler.ts` — трансформация ошибок API в читаемый формат, toast уведомления

---

## API контракты

### POST /api/auth/register

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response 201:**

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "uuid", "email": "user@example.com", "role": "USER" }
}
```

**Response 400 (валидация):**

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Некорректный формат email",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "path": "/api/auth/register"
}
```

**Response 409 (email уже существует):**

```json
{
  "statusCode": 409,
  "code": "EMAIL_EXISTS",
  "message": "Пользователь с таким email уже зарегистрирован",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "path": "/api/auth/register"
}
```

### POST /api/auth/login

**Request:** `{ "email": "...", "password": "..." }`
**Response 200:** `{ accessToken, refreshToken, user }`
**Response 401:** `{ statusCode: 401, code: "INVALID_CREDENTIALS", message: "Неверный email или пароль" }`

### POST /api/auth/refresh

**Request:** `{ "refreshToken": "..." }`
**Response 200:** `{ accessToken: "..." }`
**Response 401:** `{ statusCode: 401, code: "INVALID_TOKEN", message: "Невалидный или истёкший refresh токен" }`

---

## Зависимости для установки

**Backend:**

```bash
npm install class-validator class-transformer @types/passport-jwt
```

**Frontend:**

```bash
npm install react-router-dom @tanstack/react-query axios
npm install react-hook-form @hookform/resolvers zod
```

---

## Критерии приемки этапа

**Backend**

* [ ] Prisma схема User создана и миграция применена
* [ ] Модуль auth реализован со всеми endpoints
* [ ] JWT стратегия работает корректно
* [ ] Валидация DTO через class-validator работает
* [ ] Единый формат ошибок через ExceptionFilter
* [ ] Пароли хешируются через bcrypt
* [ ] Access токен: userId + 15 мин
* [ ] Refresh токен: 7 дней
* [ ] Endpoint refresh обновляет access токен
* [ ] Все ошибки на русском языке

**Frontend**

* [ ] React Router настроен
* [ ] React Query работает
* [ ] Axios client с interceptors
* [ ] Страницы /login и /register
* [ ] Формы валидируются
* [ ] Токены сохраняются в localStorage
* [ ] Access токен добавляется в заголовки
* [ ] Ошибки API отображаются
* [ ] Редирект после успешной регистрации/логина

**Интеграция**

* [ ] End-to-end регистрация
* [ ] End-to-end логин
* [ ] End-to-end refresh токена
* [ ] Защита роутов через токен

**Тестирование**

* [ ] Ручное тестирование сценариев
* [ ] Ошибки валидации отображаются корректно
* [ ] Ошибки API отображаются пользователю

---

## Примечания для разработчиков

* Пароли: bcrypt, 10 rounds
* JWT: разные секреты для access и refresh
* Валидация email: `@IsEmail()`
* Ошибки: на русском (Language Policy)
* Refresh токены не инвалидируются при logout (MVP)
* OAuth Google: не реализуется на этом этапе
