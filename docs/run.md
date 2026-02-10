# Запуск и инфраструктура Mentoring App

Один документ: архитектура, локальный запуск, CI, ngrok и типовые проблемы.

---

## 1. Архитектура

- **Frontend** — React (Vite), порт 5173. Отдаёт SPA, запросы к API проксируются на backend.
- **Backend** — NestJS, порт 3000, префикс `/api`. REST API, JWT, Prisma.
- **PostgreSQL** — порт 5432, БД `mentoring`.

При локальном запуске через Docker поднимаются все три сервиса. Frontend через proxy обращается к backend по относительному пути `/api`; внутри контейнера proxy идёт на `http://backend:3000`.

---

## 2. Модель веток

Используется простая схема: **main** (стабильная, для демо) и **develop** (рабочая). Фичи мержатся в `develop` через PR; когда всё ок — вручную `develop` → `main`. Подробно: [docs/BRANCHES.md](BRANCHES.md).

---

## 3. Локальный запуск (10–15 минут на новой машине)

### Что нужно

- Git, Docker и Docker Compose, (опционально) Node.js 22 — если хотите запускать без Docker только фронт/бэк.

### Шаги

1. **Клонировать репозиторий**
   ```bash
   git clone <url> Mentoring-app && cd Mentoring-app
   ```

2. **Создать файлы окружения из примеров**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   При необходимости отредактировать `backend/.env` (JWT, `DATABASE_URL` для запуска без Docker) и `frontend/.env` (см. комментарии в файлах).

3. **Запустить всё через Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Дождаться старта** (первый раз может занять пару минут: сборка образов, миграции).
   - Проверить контейнеры: `docker-compose ps`
   - Логи: `docker-compose logs -f`

5. **Открыть приложение в браузере**
   - Frontend: **http://localhost:5173**
   - API: http://localhost:3000/api

Готово. Для остановки: `docker-compose down`.

---

## 4. CI (что делает и когда)

- **Где:** GitHub Actions (файл `.github/workflows/ci.yml`).
- **Когда:** при **push** и при **pull request** в ветки **develop** и **main**.

**Что делает:**

1. **Frontend** — `npm ci` и `npm run build` в каталоге `frontend`.
2. **Backend** — `npm ci`, `prisma generate`, `npm run build` в каталоге `backend`.
3. **Docker** — сборка образов `docker/Dockerfile.backend` и `docker/Dockerfile.frontend` (без публикации и деплоя).

Ничего не деплоит. Если все шаги зелёные — можно мержить. Если красный — смотреть логи нужного job (frontend / backend / docker).

---

## 5. Запуск через ngrok (внешний доступ, демо, Telegram)

Цель — получить публичный URL для фронта (и при необходимости для API), чтобы открыть приложение с другого устройства или использовать Telegram-авторизацию (ей нужен белый домен).

### 5.1 Установка ngrok

- Скачать с [ngrok.com](https://ngrok.com/download) или через пакетный менеджер (Chocolatey, winget и т.п.).
- Зарегистрироваться на ngrok.com, получить authtoken и выполнить:
  ```bash
  ngrok config add-authtoken <ваш_токен>
  ```

### 5.2 Что пробрасывать

**Вариант А — только frontend (рекомендуется для простого демо)**  
Приложение работает как обычно: фронт на localhost:5173, запросы к API идут через proxy на localhost:3000. В браузере всё с одного origin. Тогда наружу достаточно пробросить один порт — 5173:

```bash
ngrok http 5173
```

В консоли появится публичный URL вида `https://xxxx-xx-xx-xx-xx.ngrok-free.app`. Открываете его в браузере — видите фронт; API уходит через proxy на backend, который остаётся локальным.

**Вариант Б — frontend и backend разнесены**  
Если нужен отдельный публичный URL для API (например, для мобильного клиента или тестов):

- Терминал 1: `ngrok http 5173` — фронт.
- Терминал 2: `ngrok http 3000` — бэкенд.

Тогда во фронте в `frontend/.env` нужно задать полный URL бэкенда, например:
`VITE_API_URL=https://yyyy-xx-xx-xx.ngrok-free.app/api`  
И в `backend/.env`: `FRONTEND_URL=https://xxxx-xx-xx-xx.ngrok-free.app` (URL фронта из первого ngrok).

### 5.3 Публичный URL

После запуска `ngrok http 5173` (или 3000) в терминале выводится строка **Forwarding** с HTTPS-URL. Его и используйте как публичный адрес приложения.

### 5.4 Telegram-авторизация

- Telegram Login Widget требует, чтобы сайт был открыт по публичному домену.
- В [@BotFather](https://t.me/BotFather): создать бота, затем выполнить **/setdomain** и указать домен **без** `https://` и без пути, например: `xxxx-xx-xx-xx-xx.ngrok-free.app`.
- В `backend/.env` — `TELEGRAM_BOT_TOKEN`, в `frontend/.env` — `VITE_TELEGRAM_BOT_USERNAME=ИмяБота` (без @).

### 5.5 Смена URL при перезапуске ngrok

В бесплатном плане ngrok при каждом запуске даёт новый URL. Тогда:

- Снова выполнить **/setdomain** у BotFather с новым доменом.
- Если используете вариант Б с отдельным URL бэкенда — обновить `VITE_API_URL` и `FRONTEND_URL` в `.env` и перезапустить фронт/бэк (или пересобрать фронт, т.к. VITE_ вшивается в сборку).

Автоматизацию (скрипты, обновление конфигов по URL ngrok) в этой схеме не делаем — только ручные шаги по инструкции.

---

## 6. Типовые проблемы

| Проблема | Что проверить |
|----------|----------------|
| **Backend не поднимается / нет БД** | При запуске через Docker `DATABASE_URL` задаётся в `docker-compose.yml` (хост `postgres`). Локально без Docker — в `backend/.env` должен быть `localhost:5432`. Убедиться, что postgres запущен и порт 5432 свободен. |
| **Frontend не видит API** | При локальной разработке (npm run dev) proxy в `vite.config.ts` ведёт на `BACKEND_URL` или `http://localhost:3000`. В Docker для фронта в compose задаётся `BACKEND_URL=http://backend:3000`. Не трогать, если поднимаете всё через `docker-compose up`. |
| **Ошибки CORS** | В backend в `FRONTEND_URL` должен быть тот origin, с которого открыт фронт (например, `https://xxxx.ngrok-free.app` при доступе через ngrok). Без точного совпадения схемы и домена возможны CORS-ошибки. |
| **Порты заняты** | По умолчанию: 5173 (frontend), 3000 (backend), 5432 (postgres). Проверить: `netstat -an \| findstr "5173 3000 5432"` (Windows) или `lsof -i :5173` (Linux/macOS). Либо освободить порт, либо поменять в конфигах и в `docker-compose.yml`. |
| **JWT / 401** | В `backend/.env` должны быть заданы `JWT_SECRET` и `JWT_REFRESH_SECRET`. В Docker при отсутствии `.env` в compose подставлены дефолты; для демо достаточно, для «продакшна» — заменить на свои. |
| **Telegram-кнопка не работает** | Домен в /setdomain совпадает с тем, по которому открыт сайт (без https:// и слеша). Во фронте задан `VITE_TELEGRAM_BOT_USERNAME`. Backend знает `TELEGRAM_BOT_TOKEN`. После смены URL ngrok — заново /setdomain и при необходимости обновить .env. |
| **CI падает на backend** | В CI для сборки подставляется тестовый `DATABASE_URL`; к БД не подключаемся, только `prisma generate` и `nest build`. Смотреть логи job «Backend build». |
| **CI падает на Docker** | Сборка идёт из корня репозитория; пути в Dockerfile — `backend/`, `frontend/`. Убедиться, что в репозитории есть `docker/Dockerfile.backend` и `docker/Dockerfile.frontend` и контекст сборки — корень. |

---

## 7. Деплой на Render

### Как устроено

- **Проект (Project)** в Render — это просто папка/группировка. Внутри проекта вы добавляете **сервисы**.
- **PostgreSQL** — это уже один сервис: Render его поднимает и даёт URL для подключения. Данные хранятся у Render, ничего «заливать» в БД вручную не нужно.
- **Backend** и **Frontend** — это отдельные сервисы. Код вы не загружаете вручную: вы добавляете сервис типа **Web Service** (backend) или **Static Site** (frontend), подключаете **репозиторий из Git**. При каждом деплое Render сам клонирует код из Git, собирает и запускает его.

### Как приложение взаимодействует с БД

БД уже работает на серверах Render по вашему External URL. Backend (ваш NestJS) подключается к ней по сети: в настройках Web Service вы задаёте переменную окружения **DATABASE_URL** — тот самый URL, который Render показал для PostgreSQL. Prisma при старте использует этот URL и выполняет миграции (`prisma migrate deploy`), затем приложение ходит в БД по этому же URL. То есть вы только прописываете ссылку на БД в настройках сервиса — отдельно «подключать» или заливать что-то в БД не нужно.

### Вариант А: один образ (рекомендуется)

Один сервис отдаёт и API, и фронт с одного URL (например `https://mentoring-app.onrender.com` и `https://mentoring-app.onrender.com/api`).

1. В проекте на Render: **Add Service** → **Web Service**, подключить репозиторий из Git.  
2. **Environment:** выбрать **Docker** (не Node).  
3. **Dockerfile Path:** `docker/Dockerfile.full`. **Root Directory** оставить пустым (сборка из корня репо).  
4. **Environment Variables:**  
   - `DATABASE_URL` — External URL вашей PostgreSQL;  
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — свои длинные строки;  
   - `FRONTEND_URL` — тот же URL, что и у сервиса (например `https://mentoring-app.onrender.com`), для CORS.  
5. Создать сервис. Render соберёт образ (frontend + backend в одном контейнере), при старте применятся миграции и поднимется приложение. Один URL — сайт и API.

Отдельный Static Site не нужен.

### Вариант Б: два сервиса (backend + Static Site)

**Backend (Web Service, Node)**  
1. **Add Service** → **Web Service**, репозиторий из Git.  
2. **Root Directory:** `backend`. **Build Command:** `npm ci && npx prisma generate && npm run build`. **Start Command:** `npx prisma migrate deploy && node dist/main.js`.  
3. **Environment:** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` (URL фронта — указать после шага 5).

**Frontend (Static Site)**  
4. **Add Service** → **Static Site**, тот же репозиторий. **Root Directory:** `frontend`. **Build Command:** `npm ci && npm run build`. **Publish Directory:** `dist`.  
5. **Environment:** `VITE_API_URL` = `https://<URL-backend-сервиса>/api`. В настройках backend задать `FRONTEND_URL` = URL этого статического сайта.

После этого при пушах в Git Render по желанию может автоматически пересобирать и перезапускать сервисы — код и БД связаны только через DATABASE_URL в настройках.

### Работа с БД и первый админ

- **Как работает БД:** Все данные (пользователи, профили, заявки и т.д.) хранятся в одной PostgreSQL на Render. Приложение при старте подключается по `DATABASE_URL` и при деплое выполняет только миграции (`prisma migrate deploy`) — схема таблиц обновляется, данные не трогаются. Регистрация, логин и админка работают с этой же БД.

- **Как завести админа:** В проекте есть seed-скрипт, который создаёт админа и демо-данные (теги, специальности, демо-менторы). На Render seed при деплое **не запускается**. Чтобы один раз завести админа и при желании демо-данные:
  1. Скопируйте **External Database URL** из вашего PostgreSQL-сервиса на Render.
  2. Локально в корне репозитория выполните (подставьте свой URL):
     ```bash
     cd backend
     set DATABASE_URL=postgresql://...ваш_External_URL...
     npx prisma db seed
     ```
     (В PowerShell: `$env:DATABASE_URL="postgresql://..."; npx prisma db seed`. В bash: `DATABASE_URL="postgresql://..." npx prisma db seed`.)
  3. Seed создаст пользователя **admin@example.com** с паролем **admin123** (и при отсутствии — теги, специальности, 10 демо-менторов). После первого входа в админку пароль лучше сменить (если в приложении есть смена пароля) или поменять в БД.

Если админ уже есть (по email), seed не создаёт второго. Для ещё одного админа можно либо вручную обновить поле `role` в таблице `User` в БД на `ADMIN`, либо добавить в seed другой email и перезапустить seed (осторожно: seed также создаёт демо-менторов при нехватке).

- **Перенос данных из локальной БД на Render (миграция данных):** Если в локальной PostgreSQL уже есть нужные данные (пользователи, профили, теги и т.д.) и вы хотите перенести их в БД на Render, используйте стандартный дамп и восстановление PostgreSQL.

  1. **Дамп с локальной БД** (схема + данные). В терминале, когда локальная PostgreSQL доступна (например, после `docker-compose up -d`):
     ```bash
     pg_dump "postgresql://postgres:postgres@localhost:5432/mentoring?schema=public" --no-owner --no-acl -f dump.sql
     ```
     Файл `dump.sql` будет в текущей папке.

  2. **Восстановление в БД на Render.** Подставьте **External Database URL** из Render (логин, пароль, хост, имя БД должны совпадать с форматом URL):
     ```bash
     psql "postgresql://user:password@host.render.com/dbname?sslmode=require" -f dump.sql
     ```
     У Render в URL часто уже есть параметры вроде `?sslmode=require` — оставьте их. Если `psql` ругается на SSL, добавьте `?sslmode=require` в конец URL.

  Внимание: на Render уже применены миграции (таблицы созданы). Дамп из шага 1 содержит `CREATE TABLE` и т.д. — при восстановлении могут быть ошибки «table already exists». Тогда делайте дамп **только данных** (без схемы):
  ```bash
  pg_dump "postgresql://postgres:postgres@localhost:5432/mentoring?schema=public" --no-owner --no-acl --data-only -f dump_data.sql
  psql "postgresql://...Render_URL...?sslmode=require" -f dump_data.sql
  ```
  Порядок вставки может потребовать отключения внешних ключей или правильного порядка таблиц; при конфликтах смотрите сообщения `psql` и при необходимости выгружайте по таблицам или используйте `--disable-triggers` (осторожно на проде).

  **Альтернатива: скрипт на Node** (не нужен pg_dump/psql). В проекте есть `backend/prisma/migrate-data-to-render.mjs`: он копирует все данные из одной БД в другую (сначала очищает целевые таблицы на Render, затем вставляет из локальной БД). Запуск:
  1. Поднять локальную БД: `docker-compose up -d` (из корня репо).
  2. Из папки `backend` выполнить (подставьте свой Render External URL):
     ```bash
     set SOURCE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mentoring
     set TARGET_DATABASE_URL=postgresql://user:password@host.oregon-postgres.render.com/dbname?sslmode=require
     node prisma/migrate-data-to-render.mjs
     ```
     (PowerShell: `$env:SOURCE_DATABASE_URL="..."; $env:TARGET_DATABASE_URL="..."; node prisma/migrate-data-to-render.mjs`.)
  Скрипт выведет количество скопированных строк по таблицам. Данные на Render будут полностью заменены данными из локальной БД.

---

Итог: для быстрого старта достаточно скопировать `.env.example` в `.env` для backend и frontend, выполнить `docker-compose up -d` и открыть http://localhost:5173. Для внешнего доступа — поднять ngrok на 5173; для постоянного хостинга — Render (раздел 7).
