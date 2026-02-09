import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_TAGS = [
  'Карьерный рост',
  'Лидерство',
  'Фронтенд',
  'Бэкенд',
  'Карьера в IT',
  'Смена профессии',
  'Подготовка к собеседованию',
  'Управление командой',
  'Тайм-менеджмент',
  'Продуктовая разработка',
];

const FIRST_NAMES = [
  'Александр',
  'Мария',
  'Дмитрий',
  'Анна',
  'Иван',
  'Елена',
  'Михаил',
  'Ольга',
  'Сергей',
  'Наталья',
];

const LAST_NAMES = [
  'Иванов',
  'Петрова',
  'Сидоров',
  'Козлова',
  'Смирнов',
  'Морозова',
  'Волков',
  'Новикова',
  'Фёдоров',
  'Егорова',
];

const MIDDLE_NAMES = [
  'Александрович',
  'Сергеевич',
  'Дмитриевна',
  'Ивановна',
  null,
  null,
];

const SPECIALTIES_FOR_SEED = [
  'Frontend-разработчик',
  'Backend-разработчик',
  'Fullstack-разработчик',
  'Java-разработчик',
  'Python-разработчик',
  'Mobile-разработчик (iOS / Android)',
  'QA Engineer (Manual / Automation)',
  'Системный аналитик (SA)',
  'Бизнес-аналитик (BA)',
  'Product Manager (PM)',
  'Data Analyst',
  'Data Scientist',
  'DevOps-инженер',
  'UI/UX Designer',
  'Архитектор (Software Architect)',
];

const LEVELS = ['JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD'];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Краснодар',
  'Самара',
  'Воронеж',
  'Ростов-на-Дону',
];

const BIO_SAMPLES = [
  'Более 8 лет в разработке. Помогаю расти от джуна до мидла.',
  'Экс-тимлид в продуктовой компании. Фокус на карьере и лидерстве.',
  'Люблю объяснять сложное простым языком. Менторю с 2020 года.',
  'Специализация: веб-разработка и архитектура. Готов к менторству.',
  'Прошла путь от стажёра до сеньора. Хочу делиться опытом.',
  'Работаю в крупном продукте. Помогаю с собеседованиями и онбордингом.',
  'Backend и базы данных. Консультирую по карьере в IT.',
  'Фокус на продукте и коммуникации. Помогаю PM-ам и аналитикам.',
  'QA и автоматизация тестов. Готова помогать с карьерой в тестировании.',
  'Дизайн интерфейсов и UX-исследования. Менторю дизайнеров.',
];

const WORK_FORMATS = [
  'Онлайн (звонки, переписка)',
  'Очно в Москве',
  'Гибрид: онлайн + очно по договорённости',
  'Только онлайн, асинхронно + раз в неделю созвон',
  'Онлайн, раз в 2 недели',
];

const DESCRIPTIONS = [
  'Помогаю с карьерным ростом, подготовкой к собеседованиям и выбором технологий. Разбираем кейсы из практики, делаем код-ревью, строим план развития.',
  'Менторство по веб-разработке: от основ до продвинутых тем. Помощь с портфолио, резюме и прохождением технических интервью.',
  'Фокус на продукте и коммуникации с заказчиками. Помогаю выстроить процессы, приоритизацию и работу с командой.',
  'Карьера в IT: смена специализации, рост до тимлида, подготовка к собеседованиям. Делимся опытом и разбираем ваши кейсы.',
  'Backend и базы данных. Помогаю с проектами, код-ревью и планированием карьеры в разработке.',
  'QA и тестирование: ручное и автотесты. Помогаю войти в профессию и вырасти до сеньора.',
  'Дизайн интерфейсов и UX. Консультации по портфолио, процессам и карьере в дизайне.',
  'Fullstack и архитектура. Менторю по реальным задачам и карьерным решениям.',
  'Управление командой и лидерство. Работаем над soft skills и карьерой в менеджменте.',
  'Data-направление: аналитика и ML. Помогаю с обучением и карьерой в данных.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickSeveral<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  // Админ для входа в админ-панель (если ещё нет)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log(
      `Создан админ: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (смените пароль в проде!)`
    );
  }

  const specialtyCount = await prisma.specialty.count();
  if (specialtyCount === 0) {
    for (let i = 0; i < SPECIALTIES_FOR_SEED.length; i++) {
      const name = SPECIALTIES_FOR_SEED[i]!;
      await prisma.specialty.upsert({
        where: { name },
        create: { name, sortOrder: i },
        update: {},
      });
    }
    console.log('Созданы специальности:', SPECIALTIES_FOR_SEED.length);
  }

  const tagCount = await prisma.tag.count();
  if (tagCount === 0) {
    for (const name of DEFAULT_TAGS) {
      await prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
    }
    console.log('Созданы теги по умолчанию:', DEFAULT_TAGS.length);
  }

  const mentors = await prisma.mentor.findMany({
    select: { id: true, specializationTopics: true },
  });
  for (const mentor of mentors) {
    const topics = mentor.specializationTopics ?? [];
    for (const topicName of topics) {
      const name = topicName.trim();
      if (!name) continue;
      const tag = await prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await prisma.mentorTag.upsert({
        where: {
          mentorId_tagId: { mentorId: mentor.id, tagId: tag.id },
        },
        create: { mentorId: mentor.id, tagId: tag.id },
        update: {},
      });
    }
  }
  if (mentors.length > 0) {
    console.log(
      'Миграция specializationTopics -> Tag/MentorTag выполнена для',
      mentors.length,
      'менторов'
    );
  }

  // Демо-менторы: 10 штук с рандомными данными
  const existingDemo = await prisma.user.count({
    where: { email: { startsWith: 'mentor-demo-' } },
  });
  if (existingDemo >= 10) {
    console.log('Демо-менторы уже созданы (10 шт.), пропуск.');
  } else {
    const passwordHash = await bcrypt.hash('password123', 10);
    const allTags = await prisma.tag.findMany({ select: { id: true } });

    for (let i = 1; i <= 10; i++) {
      const email = `mentor-demo-${i}@example.com`;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) continue;

      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const middleName = pick(MIDDLE_NAMES);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          middleName,
          specialty: pick(SPECIALTIES_FOR_SEED),
          level: pick(LEVELS) as 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD',
          bio: pick(BIO_SAMPLES),
          city: pick(CITIES),
        },
      });

      const mentor = await prisma.mentor.create({
        data: {
          profileId: profile.id,
          description: pick(DESCRIPTIONS),
          workFormat: pick(WORK_FORMATS),
          acceptsRequests: Math.random() > 0.25,
          statusComment:
            Math.random() > 0.75
              ? 'Сейчас занят текущими менти, открою слоты позже.'
              : null,
          maxMentees: [2, 3, 4, 5][Math.floor(Math.random() * 4)]!,
          specializationTopics: [],
        },
      });

      const tagIds = pickSeveral(
        allTags.map((t) => t.id),
        1 + Math.floor(Math.random() * 3)
      );
      for (const tagId of tagIds) {
        await prisma.mentorTag.create({
          data: { mentorId: mentor.id, tagId },
        });
      }
    }
    console.log('Созданы 10 демо-менторов (логин: mentor-demo-1@example.com … mentor-demo-10@example.com, пароль: password123).');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
