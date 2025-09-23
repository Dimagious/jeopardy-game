# US-001: Каркас проекта - Завершено ✅

## Что реализовано

### ✅ Базовый каркас
- **Vite + React + TypeScript** - современный стек для быстрой разработки
- **React Router** - навигация между страницами
- **Tailwind CSS v3.4.0** - стилизация с кастомными компонентами для Jeopardy

### ✅ Базовые страницы
- **`/login`** - страница входа (демо-режим)
- **`/host/:gameId`** - пульт ведущего с игровым полем и контролами
- **`/screen/:gameId`** - большой экран для отображения игры

### ✅ UI-кит компонентов
- **Button** - кнопки с вариантами (primary, secondary, danger, success)
- **Card** - карточки с заголовком, контентом и футером
- **Modal** - модальные окна с backdrop и клавишей Escape
- **Утилиты** - `cn()` для объединения классов

### ✅ Дизайн-система
- **Jeopardy-стили** - кастомные классы `.jeopardy-board`, `.jeopardy-question`, `.jeopardy-answer`
- **Типографика** - крупные шрифты для экрана (`.screen-text-lg`, `.screen-text-xl`, `.screen-text-2xl`)
- **Анимации** - мигание `.animate-blink` для выбора ячеек
- **Цветовая схема** - синий (#060CE9) и золотой (#FFD700) в стиле Jeopardy

### ✅ Sentry и телеметрия
- **Sentry** - мониторинг ошибок и производительности
- **Аналитика** - отслеживание событий: `game_start`, `board_select`, `judge`, `buzz_first`, `login`
- **Конфигурация** - через переменные окружения

### ✅ GitHub Actions CI
- **Линтинг** - ESLint проверка кода
- **Типизация** - TypeScript проверка
- **Тесты** - Vitest (готов к добавлению тестов)
- **Сборка** - проверка production build
- **E2E** - Playwright тесты (для PR)

## Как запустить

### Требования
- **Node.js**: 20.11+ (рекомендуется 20.19+ или 22.12+)
- **npm**: 10.2+

### Разработка
```bash
npm run dev
```
Откроется http://localhost:5173

> **Примечание**: Если у вас Node.js 20.11.0, проект использует Vite 5.4.20 для совместимости. Для лучшей производительности рекомендуется обновить Node.js до 20.19+.

> **Важно**: После изменений в Tailwind конфигурации или CSS файлах может потребоваться перезапуск dev сервера для применения стилей.

### Сборка
```bash
npm run build
```

### Тесты
```bash
npm run test
npm run e2e
```

### Линтинг
```bash
npm run lint
npm run format
```

## Структура проекта

```
src/
├── pages/           # Страницы приложения
│   ├── LoginPage.tsx
│   ├── HostPage.tsx
│   └── ScreenPage.tsx
├── ui/              # UI компоненты
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── index.ts
├── shared/          # Общие утилиты
│   ├── types/       # TypeScript типы
│   ├── analytics.ts # Аналитика
│   ├── sentry.ts    # Sentry конфигурация
│   └── utils.ts     # Утилиты
└── main.tsx         # Точка входа
```

## Переменные окружения

Создайте `.env` файл на основе `env.example`:

```env
# Sentry (опционально)
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_ENABLED=false

# Supabase (для будущих US)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Acceptance Criteria - Выполнено ✅

- [x] `npm run dev/build` работает
- [x] Prettier/ESLint настроены
- [x] GitHub Actions: lint+build
- [x] Базовые страницы: `/host/:gameId`, `/screen/:gameId`, `/login`
- [x] FE каркас; роутинг; дизайн‑система (Tailwind config)
- [x] UI‑кит кнопок/карт/модалок
- [x] Sentry и базовая телеметрия (флаг env)

## Следующие шаги

Готово к **US-002** - "Экран «Поле» и «Пульт» локально" с:
- Локальной моделью данных (in-memory)
- Событиями Realtime (мок/шина)
- Интерфейсом событий в `@/shared/events`