# Jeopardy Game

Игровое web-приложение под формат Jeopardy для офлайн/онлайн мероприятий.

## 🎯 Текущий статус

**US-001: Каркас проекта** - ✅ Завершено

- Базовый каркас Vite + React + TypeScript + Tailwind
- Страницы: `/login`, `/host/:gameId`, `/screen/:gameId`
- UI-кит компонентов и дизайн-система
- Sentry и аналитика
- GitHub Actions CI/CD

## 🚀 Быстрый старт

### Требования
- Node.js 20.11+ (рекомендуется 20.19+)
- npm 10.2+

### Запуск
```bash
npm install
npm run dev
```

Откроется http://localhost:5173

## 📚 Документация

- [Backlog и архитектура](docs/backlog.md)
- [User Stories](docs/user-stories/)
- [US-001: Каркас проекта](docs/user-stories/US-001-scaffold.md)

## 🏗️ Технологии

- **Frontend**: React + Vite + TypeScript + React Router
- **Стили**: Tailwind CSS v3.4.0
- **Состояние**: Zustand (готов к подключению)
- **Мониторинг**: Sentry + аналитика
- **CI/CD**: GitHub Actions

