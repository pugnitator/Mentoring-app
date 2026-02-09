# План разработки MVP платформы менторинга

## Общая стратегия
Разработка ведётся по принципу MVP: сначала критичные фичи для базового функционала, затем расширение.  
Каждая фича реализуется end-to-end: схема БД → backend API → frontend UI → тестирование.

---

## Этапы разработки

### Этап 1: Foundation & Authentication (UC-01, UC-02)
**Цель:** Базовая инфраструктура и система аутентификации

**Backend:**
- Prisma схема для `users` (email, password hash, role, status)
- Модуль `auth`: регистрация (email+password), логин, refresh токены
- JWT стратегия (access + refresh)
- Guard для защищённых роутов
- Валидация DTO (class-validator)
- Единый формат ошибок (exception filter)

**Frontend:**
- React Router с базовыми маршрутами
- React Query с axios клиентом
- Страницы: `/login`, `/register`
- Компоненты: формы логина/регистрации, обработка ошибок
- Хранение токенов (localStorage), interceptor для добавления токена в запросы

**Результат:** Пользователь может зарегистрироваться и войти, получить JWT токены

---

### Этап 2: User Profile & Role Selection (UC-03, UC-04)
**Цель:** Профили пользователей и выбор роли

**Backend:**
- Расширить Prisma схему: `profiles` (общие поля), `mentors`, `mentees`
- Модуль `users`: CRUD профиля
- Модуль `profiles`: управление общими полями профиля
- Модуль `mentors`: управление профилем ментора (теги, описание услуг, формат работы, статус приёма заявок, лимиты)
- Модуль `mentees`: управление профилем менти (цели, статус поиска)
- Endpoint выбора роли (ментор/менти)
- Загрузка фото профиля (локальное хранение или base64 в БД для MVP)

**Frontend:**
- Страница выбора роли после регистрации
- Личный кабинет: `/profile`
- Формы редактирования профиля (общие поля + поля роли)
- Компонент загрузки фото
- Отображение аватара (фото или инициалы)

**Результат:** Пользователь может выбрать роль и заполнить профиль

---

### Этап 3: Tags & Mentors Catalog (UC-05, UC-06)
**Цель:** Каталог менторов с фильтрацией

**Backend:**
- Prisma схема: `tags`, `mentor_tags` (many-to-many)
- Модуль `tags`: CRUD тегов (для админа)
- Модуль `mentors`: публичный каталог менторов
- Endpoints:
  - `GET /api/mentors` (список с пагинацией)
  - `GET /api/mentors/:id` (детали ментора)
- Фильтры: специальность, теги, статус приёма заявок
- По умолчанию показывать только принимающих заявки

**Frontend:**
- Страница каталога: `/mentors`
- Компонент карточки ментора
- Компоненты фильтров (специальность, теги, статус)
- Пагинация списка
- Страница деталей ментора: `/mentors/:id`

**Результат:** Работает каталог менторов с фильтрацией

---

### Этап 4: Favorites (UC-07)
**Цель:** Система избранного

**Backend:**
- Prisma схема: `favorites` (mentee_id, mentor_id)
- Модуль `favorites`: добавление/удаление из избранного
- Endpoints:
  - `POST /api/favorites` (добавить)
  - `DELETE /api/favorites/:mentorId` (удалить)
  - `GET /api/favorites` (список избранного менти)
- Подсчёт количества добавлений в избранное для ментора (aggregate)

**Frontend:**
- Кнопка "В избранное" на карточке ментора
- Страница избранного: `/favorites`
- Индикация статуса (в избранном / не в избранном)

**Результат:** Менти может добавлять менторов в избранное

---

### Этап 5: Requests System (UC-08, UC-09, UC-10)
**Цель:** Система заявок на менторство

**Backend:**
- Prisma схема: `requests` (mentee_id, mentor_id, message, status, created_at, updated_at)
- Модуль `requests`: создание, просмотр, обработка заявок
- Endpoints:
  - `POST /api/requests` (отправить заявку)
  - `GET /api/requests/incoming` (входящие для ментора)
  - `GET /api/requests/outgoing` (исходящие для менти)
  - `PATCH /api/requests/:id/accept` (принять)
  - `PATCH /api/requests/:id/reject` (отклонить)
- Бизнес-логика: проверка статуса ментора, лимитов активных менти
- Email-уведомление при новой заявке (модуль notifications, базовый шаблон)

**Frontend:**
- Страница отправки заявки: `/mentors/:id/request`
- Страница заявок ментора: `/requests/incoming`
- Страница заявок менти: `/requests/outgoing`
- Компоненты: форма заявки, список заявок, действия (принять/отклонить)

**Результат:** Работает система заявок с уведомлениями

---

### Этап 6: Connections & Detachment (UC-11)
**Цель:** Управление связями ментор-менти

**Backend:**
- Prisma схема: `connections` (mentor_id, mentee_id, request_id, status, detached_at, reason)
- Модуль `connections`: создание связи при принятии заявки, открепление
- Endpoints:
  - `GET /api/connections` (активные связи для текущего пользователя)
  - `POST /api/connections/:id/detach` (открепиться)
- При откреплении: скрытие контактов, обновление статуса связи
- Email-уведомление об откреплении

**Frontend:**
- Страница активных связей: `/connections`
- Компонент отображения контактов (после принятия заявки)
- Форма открепления с причиной

**Результат:** Работает управление связями и открепление

---

### Этап 7: Admin Panel (UC-13)
- **Цель:** Администрирование справочников (теги, специальности) и просмотр пользователей.
- **Backend:**
  - Role guard для проверки прав администратора (только роль ADMIN).
  - Модуль `admin`: управление тегами, управление специальностями, просмотр пользователей.
  - Endpoints:
    - Теги: GET/POST/PATCH/DELETE /api/admin/tags (по аналогии с текущим планом).
    - Специальности: GET/POST/PATCH/DELETE /api/admin/specialties.
    - Пользователи: GET /api/admin/users (с пагинацией и при необходимости фильтрами).
  - Публичный (или для авторизованных) GET /api/specialties — список специальностей для форм и фильтра каталога.
  - Prisma: модель Specialty (id, name, sortOrder?, createdAt); при удалении специальности проверка использования в Profile.specialty.
- **Frontend:**
  - Админ-панель: `/admin` (доступ только для ADMIN).
  - Страница управления тегами: `/admin/tags`.
  - Страница управления специальностями: `/admin/specialties`.
  - Страница пользователей: `/admin/users`.
  - Формы CRUD для тегов и специальностей.
  - Форма профиля и фильтр каталога переходят на загрузку списка специальностей из API (GET /api/specialties).
- **Результат:** Админ может управлять тегами и специальностями, просматривать пользователей; справочник специальностей используется в профиле и каталоге.

## 5.2. Раздел «Технические детали реализации» / Prisma схема

В списке основных моделей (примерно строка 291) добавить строку:

- **Specialty:** id, name, sortOrder?, createdAt

Строку с Profile оставить как есть (specialty по-прежнему в Profile как строка; справочник Specialty — отдельная сущность для админки и выбора в UI).

## 5.3. Раздел «Backend структура модулей»

В перечне модулей убедиться, что указан модуль `admin` (уже есть). При желании уточнить в скобках: «управление тегами, специальностями, просмотр пользователей».

---

### Этап 8: Notifications & Email (UC-12)
**Цель:** Полноценная система email-уведомлений

**Backend:**
- Модуль `notifications`: очередь отправки email (nodemailer)
- Шаблоны писем (HTML + текст):
  - Новая заявка
  - Решение по заявке (принята/отклонена)
  - Открепление
- Настройки пользователя: включение/отключение уведомлений
- Prisma схема: `notification_settings` (user_id, email_enabled)

**Frontend:**
- Настройки уведомлений в профиле
- Переключатель включения/отключения email

**Результат:** Работают все email-уведомления с возможностью отключения

---

### Этап 9: UI/UX Polish & Themes
**Цель:** Финальная полировка интерфейса

**Frontend:**
- Реализация светлой/тёмной темы (Tailwind dark mode)
- Переключатель темы в навигации
- Сохранение выбранной темы (localStorage)
- Responsive дизайн для мобильных устройств
- Улучшение UX: loading states, error boundaries, toast-уведомления
- Единый стиль форм и кнопок (Headless UI компоненты)

**Результат:** Полностью отполированный интерфейс с поддержкой тем

---

### Этап 10: Testing & Deployment Prep
**Цель:** Подготовка к запуску

**Backend:**
- Unit тесты для критичных модулей (auth, requests)
- E2E тесты для основных сценариев
- Настройка логирования (Winston или встроенный Logger)
- Валидация всех DTO
- Обработка edge cases

**Frontend:**
- Тестирование основных пользовательских сценариев
- Проверка работы на разных браузерах
- Оптимизация bundle size

**Infrastructure:**
- Настройка Nginx для production (HTTPS, проксирование)
- Обновление docker-compose для production
- Документация API (Swagger/OpenAPI опционально)

**Результат:** Готовый к запуску MVP

---

## Приоритизация фич для MVP

**Must Have (критично для MVP):**
- Foundation & Authentication  
- User Profile & Role Selection  
- Tags & Mentors Catalog  
- Requests System  
- Connections & Detachment  
- UI/UX Polish & Themes  

**Should Have (важно, но можно упростить):**
- Favorites  
- Notifications & Email (базовая версия)  

**Nice to Have (можно отложить):**
- Admin Panel (можно начать с ручного управления тегами через БД)

---

## Технические детали реализации

**Backend структура модулей**
backend/src/
├── modules/
│ ├── auth/
│ ├── users/
│ ├── profiles/
│ ├── mentors/
│ ├── mentees/
│ ├── tags/
│ ├── favorites/
│ ├── requests/
│ ├── connections/
│ ├── notifications/
│ └── admin/
├── common/
│ ├── guards/
│ ├── filters/
│ └── interceptors/
└── config/

**Frontend структура**
frontend/src/
├── app/
│ └── routes/
├── features/
│ ├── auth/
│ ├── profile/
│ ├── mentors/
│ ├── favorites/
│ ├── requests/
│ ├── connections/
│ └── admin/
├── shared/
│ ├── api/
│ ├── ui/
│ └── lib/
└── styles/


**Prisma схема (основные модели)**
- User: id, email, passwordHash, role, status, createdAt  
- Profile: id, userId, firstName, lastName, middleName, specialty, level, bio, city, avatarUrl  
- Mentor: id, profileId, description, workFormat, acceptsRequests, statusComment, maxMentees  
- Mentee: id, profileId, goal, desiredPosition, searchStatus  
- Tag: id, name, description  
- MentorTag: mentorId, tagId  
- Favorite: id, menteeId, mentorId, createdAt  
- Request: id, menteeId, mentorId, message, status, createdAt, updatedAt  
- Connection: id, mentorId, menteeId, requestId, status, detachedAt, reason  

---

## Метрики успеха этапов
Каждый этап считается завершённым, когда:  
- Реализованы все use cases этапа  
- Backend покрыт базовыми тестами  
- Frontend протестирован вручную по сценариям  
- Документированы API endpoints  
- Код проходит линтер без критичных ошибок
