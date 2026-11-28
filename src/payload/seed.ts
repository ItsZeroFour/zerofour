import fs from 'node:fs/promises';
import path from 'node:path';
import type { Payload } from 'payload';
import ruMessages from '../../messages/ru.json';
import enMessages from '../../messages/en.json';

type L = { ru: string; en: string };
type ProjectSeed = {
  slug: string;
  order: number;
  featured?: boolean;
  nda?: boolean;
  year?: string;
  liveUrl?: string;
  stack: string[];
  title: L;
  client: L;
  role: L;
  summary: L;
  highlights: { ru: string[]; en: string[] };
  metrics: { value: L; label: L }[];
};

/** Факты взяты из резюме. Тексты — под голос бренда: технично, на «Вы» к читателю. */
const PROJECTS: ProjectSeed[] = [
  {
    slug: 'avgust-promo',
    order: 1,
    featured: true,
    stack: ['React', 'Node.js', 'VK API', 'VK Bridge', 'VK Mini Apps'],
    title: { ru: 'Промо к фильму «Август»', en: '“August” film promo' },
    client: { ru: 'Промо-кампания фильма', en: 'Film marketing campaign' },
    role: { ru: 'Фронтенд и мини-игры', en: 'Frontend & mini-games' },
    summary: {
      ru: 'Мини-игры и розыгрыш внутри ВКонтакте и на отдельном сайте. Один код — два входа: VK Mini App и обычный домен.',
      en: 'Mini-games and a prize draw inside VK and on a standalone site. One codebase, two doors: a VK Mini App and a regular domain.',
    },
    highlights: {
      ru: [
        'Разработал мини-игры и основную часть фронтенда.',
        'Авторизация через VK и разделение по домену: внутри VK открывается мини-приложение, снаружи — обычный сайт.',
        'Проверка условий розыгрыша через VK API — подписка, репост, комментарий: кастомные хуки и VK Bridge на клиенте, Node.js на сервере.',
      ],
      en: [
        'Built the mini-games and most of the frontend.',
        'VK sign-in with domain split: a Mini App inside VK, a regular website everywhere else.',
        'Prize-draw checks via VK API — subscribe, repost, comment: custom hooks and VK Bridge on the client, Node.js on the server.',
      ],
    },
    metrics: [{ value: { ru: '100 000+', en: '100,000+' }, label: { ru: 'пользователей', en: 'users' } }],
  },
  {
    slug: 'credit-applications',
    order: 2,
    nda: true,
    year: '2025 —',
    stack: ['React 19', 'TypeScript', 'Redux Toolkit', 'Node.js', 'Strapi', 'МТС RIM', 'Mobile ID'],
    title: { ru: 'Сервис заявок с камерой-сканером', en: 'Applications service with a camera scanner' },
    client: { ru: 'Кредитная организация', en: 'Lending company' },
    role: { ru: 'Фронтенд, сервер, перенос', en: 'Frontend, server, migration' },
    summary: {
      ru: 'Паспорт снимается камерой телефона, распознаётся и сам заполняет форму. Пользователь только проверяет.',
      en: 'The passport is captured with the phone camera, recognised and fills the form itself. The user only double-checks.',
    },
    highlights: {
      ru: [
        'Спроектировал и написал модуль сканирования: камера, рамка документа, автосъёмка, предпросмотр, пересъёмка.',
        'Распознавание через API МТС RIM, вход через Mobile ID (SMS/PUSH), сервер на Node.js, админка на Strapi.',
        'Перенёс сайт, сервер и админку с Бегета в Яндекс Облако, настроил Метрику с целями и Google Analytics.',
      ],
      en: [
        'Designed and built the scanner: camera, document frame, auto-capture, preview, retake.',
        'Recognition via MTS RIM API, sign-in via Mobile ID (SMS/PUSH), Node.js server, Strapi admin.',
        'Moved the site, server and admin from Beget to Yandex Cloud; set up Metrica goals and Google Analytics.',
      ],
    },
    metrics: [{ value: { ru: '3,7 → 2,1 с', en: '3.7 → 2.1 s' }, label: { ru: 'LCP после оптимизации', en: 'LCP after optimisation' } }],
  },
  {
    slug: 'retail-promo-game',
    order: 3,
    nda: true,
    year: '2025 —',
    stack: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'JWT', 'ActiveMQ (STOMP)'],
    title: { ru: 'Промо-игра для ритейлера', en: 'Retail promo game' },
    client: { ru: 'Крупный региональный ритейлер', en: 'Major regional retailer' },
    role: { ru: 'Бэкенд игры', en: 'Game backend' },
    summary: {
      ru: 'Игра внутри мобильного приложения сети: вход без повторного ввода данных и ежедневная выгрузка прогресса заказчику.',
      en: 'A game inside the retailer’s mobile app: sign-in without retyping anything and a daily progress export to the client.',
    },
    highlights: {
      ru: [
        'Вход из WebView приложения без повторной авторизации: проверка параметров, JWT, HttpOnly cookie.',
        'Агрегация в MongoDB и ежедневная отправка данных заказчику через ActiveMQ (STOMP).',
        'Поддержка, разбор инцидентов и новые функции после запуска.',
      ],
      en: [
        'Sign-in from the app’s WebView with no second login: parameter checks, JWT, HttpOnly cookie.',
        'MongoDB aggregation and a daily data feed to the client over ActiveMQ (STOMP).',
        'Post-launch support, incident handling and new features.',
      ],
    },
    metrics: [
      { value: { ru: '40 000', en: '40,000' }, label: { ru: 'регистраций', en: 'sign-ups' } },
      { value: { ru: '+37%', en: '+37%' }, label: { ru: 'средний чек за год', en: 'average basket, year on year' } },
      { value: { ru: '+28%', en: '+28%' }, label: { ru: 'MAU за год', en: 'MAU, year on year' } },
    ],
  },
  {
    slug: 'ai-image-platform',
    order: 4,
    stack: ['React', 'TypeScript', 'WebSocket', 'ComfyUI API'],
    title: { ru: 'ИИ-платформа генерации изображений', en: 'AI image generation platform' },
    client: { ru: 'Собственный продукт студии', en: 'Studio product' },
    role: { ru: 'Фронтенд и интеграция', en: 'Frontend & integration' },
    summary: {
      ru: 'Очередь задач с живыми статусами: пользователь видит свою позицию и результат, не обновляя страницу.',
      en: 'A job queue with live statuses: users see their position and the result without reloading the page.',
    },
    highlights: {
      ru: [
        'Интерфейс: настройки запроса, отправка задач, очередь с позицией пользователя, показ результатов.',
        'Статусы генерации в реальном времени по WebSocket (вместе с коллегой).',
        'Серверная интеграция с ComfyUI по API и функция «Поделиться» в соцсети.',
      ],
      en: [
        'UI: prompt settings, job submission, queue with the user’s position, results view.',
        'Real-time generation status over WebSocket (with a colleague).',
        'Server-side ComfyUI API integration and a social “Share” feature.',
      ],
    },
    metrics: [{ value: { ru: '10 000+', en: '10,000+' }, label: { ru: 'пользователей', en: 'users' } }],
  },
  {
    slug: 'state-education-site',
    order: 5,
    nda: true,
    year: '2023 —',
    stack: ['Next.js', 'TypeScript', 'Redux Toolkit', 'FSD', 'Jest', 'React Testing Library', 'Playwright'],
    title: { ru: 'Сайт государственного вуза', en: 'State university website' },
    client: { ru: 'Государственное образовательное учреждение', en: 'State educational institution' },
    role: { ru: 'Фронтенд, архитектура, доступность', en: 'Frontend, architecture, accessibility' },
    summary: {
      ru: 'Разделы для абитуриентов, формы и версия для слабовидящих по ГОСТ, сделанная мной от начала до конца.',
      en: 'Applicant sections, forms, and a low-vision version to the Russian GOST standard that I built end to end.',
    },
    highlights: {
      ru: [
        'Вместе с командой выбрал стек и спроектировал архитектуру по FSD.',
        'Главная, разделы для абитуриентов, формы с валидацией и обработкой ошибок сервера.',
        'Тесты на Jest, React Testing Library и Playwright.',
      ],
      en: [
        'Chose the stack with the team and designed an FSD architecture.',
        'Home page, applicant sections, forms with validation and server error handling.',
        'Tests with Jest, React Testing Library and Playwright.',
      ],
    },
    metrics: [{ value: { ru: 'ГОСТ', en: 'GOST' }, label: { ru: 'версия для слабовидящих', en: 'low-vision version' } }],
  },
  {
    slug: 'construction-sites',
    order: 6,
    liveUrl: 'https://sdstroy21.ru',
    stack: ['Next.js', 'SSR', 'SEO'],
    title: { ru: 'Сайты строительных компаний', en: 'Construction company websites' },
    client: { ru: 'sdstroy21.ru и aobig.ru', en: 'sdstroy21.ru and aobig.ru' },
    role: { ru: 'Разработка и деплой', en: 'Build & deploy' },
    summary: {
      ru: 'Два сайта на Next.js с серверным рендерингом: SEO, формы заявок и настройка деплоя.',
      en: 'Two server-rendered Next.js sites: SEO, lead forms and deployment setup.',
    },
    highlights: {
      ru: ['Серверный рендеринг ради поисковой выдачи.', 'Формы заявок и аналитика.', 'Деплой и настройка домена.'],
      en: ['Server rendering for search visibility.', 'Lead forms and analytics.', 'Deployment and domain setup.'],
    },
    metrics: [],
  },
];

export async function seed(payload: Payload) {
  const log: string[] = [];

  // ---- Портрет ----------------------------------------------------------------
  let portraitId: number | string | undefined;
  const existingPortrait = await payload.find({ collection: 'media', where: { filename: { contains: 'portrait-front' } }, limit: 1 });
  if (existingPortrait.docs[0]) {
    portraitId = existingPortrait.docs[0].id;
    log.push('portrait: exists');
  } else {
    try {
      const file = path.join(process.cwd(), 'public', 'images', 'portrait-front.png');
      const data = await fs.readFile(file);
      const media = await payload.create({
        collection: 'media',
        locale: 'ru',
        data: { alt: '' },
        file: { data, mimetype: 'image/png', name: 'portrait-front.png', size: data.length },
      });
      portraitId = media.id;
      log.push('portrait: uploaded');
    } catch (e) {
      // Например, Blob Store с приватным доступом. Сайт возьмёт локальный портрет.
      log.push(`portrait: skipped (${(e as Error).message})`);
    }
  }

  // ---- Обложка и контакты -----------------------------------------------------
  await payload.updateGlobal({
    slug: 'site',
    locale: 'ru',
    data: {
      name: 'Даниил Андреев',
      role: 'Frontend-разработчик',
      lead: ruMessages.hero.leadDefault,
      cta: 'Смотреть работы',
      clients: 'Яндекс · Кинопоиск · Фонд кино',
      ...(portraitId ? { portrait: portraitId as number } : {}),
      portraitCaption: 'Рис. 01 — автор, в рабочем костюме',
      index: '№ 04 — Фронтенд',
      edition: 'Издание 2026 · RU',
      city: 'Москва · UTC+3',
      location: 'Москва · UTC+3 · удалённо или офис',
      openToWork: true,
      statusText: 'Открыт к предложениям',
      facts: [
        { value: '4 года', label: 'коммерческой разработки' },
        { value: '60+', label: 'проектов в команде' },
        { value: '100 000+', label: 'пользователей у одного промо' },
        { value: '3,7 → 2,1 с', label: 'LCP после моей оптимизации' },
      ],
      telegram: 'zeroandreev',
      email: 'itszerofourx@gmail.com',
      seoTitle: 'Даниил Андреев — Frontend-разработчик · ZeroFour',
      seoDescription: 'Фронтенд на React и Next.js для продуктов с живой аудиторией: от сканера паспорта до мини-игр на 100 000 человек.',
    },
  });
  const siteRu = await payload.findGlobal({ slug: 'site', locale: 'ru' });
  await payload.updateGlobal({
    slug: 'site',
    locale: 'en',
    data: {
      name: 'Daniil Andreev',
      role: 'Frontend Developer',
      lead: enMessages.hero.leadDefault,
      cta: 'See the work',
      clients: 'Yandex · Kinopoisk · Russian Cinema Fund',
      portraitCaption: 'Fig. 01 — the author, in work attire',
      index: 'No. 04 — Frontend',
      edition: '2026 Edition · EN',
      city: 'Moscow · UTC+3',
      location: 'Moscow · UTC+3 · remote or on-site',
      statusText: 'Open to offers',
      facts: ((siteRu.facts ?? []) as { id?: string }[]).map((row, i) => ({
        id: row.id,
        ...[
          { value: '4 yrs', label: 'of commercial development' },
          { value: '60+', label: 'team projects shipped' },
          { value: '100,000+', label: 'users on a single promo' },
          { value: '3.7 → 2.1 s', label: 'LCP after my optimisation' },
        ][i],
      })),
      seoTitle: 'Daniil Andreev — Frontend Developer · ZeroFour',
      seoDescription: 'React and Next.js frontends for products with a real audience: from a passport scanner to mini-games played by 100,000 people.',
    },
  });
  log.push('site: ru+en');

  // ---- Проекты ----------------------------------------------------------------
  for (const p of PROJECTS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1, draft: true });
    if (found.docs[0]) {
      log.push(`project ${p.slug}: exists`);
      continue;
    }
    const created = await payload.create({
      collection: 'projects',
      locale: 'ru',
      draft: false,
      data: {
        _status: 'published',
        slug: p.slug,
        order: p.order,
        featured: Boolean(p.featured),
        nda: Boolean(p.nda),
        year: p.year,
        liveUrl: p.liveUrl,
        stack: p.stack,
        title: p.title.ru,
        client: p.client.ru,
        role: p.role.ru,
        summary: p.summary.ru,
        highlights: p.highlights.ru.map((text) => ({ text })),
        metrics: p.metrics.map((m) => ({ value: m.value.ru, label: m.label.ru })),
      },
    });
    await payload.update({
      collection: 'projects',
      id: created.id,
      locale: 'en',
      draft: false,
      data: {
        _status: 'published',
        title: p.title.en,
        client: p.client.en,
        role: p.role.en,
        summary: p.summary.en,
        highlights: p.highlights.en.map((text) => ({ text })),
        metrics: ((created.metrics ?? []) as { id?: string }[]).map((row, i) => ({
          id: row.id,
          value: p.metrics[i].value.en,
          label: p.metrics[i].label.en,
        })),
      },
    });
    log.push(`project ${p.slug}: created`);
  }

  return log;
}
