# US-203: CRUD категорий и вопросов

## Цель
Как админ, я хочу создавать и управлять категориями и вопросами в игре через веб-интерфейс, чтобы настраивать контент для мероприятий.

## Acceptance Criteria

- **Редактор игры**: На странице `/org/:orgId/admin/games/:gameId/edit` доступен полнофункциональный редактор игры с двумя панелями - категории и вопросы.
- **CRUD категорий**: Возможность создавать, редактировать, удалять и дублировать категории с полями:
  - Название (обязательное, до 50 символов)
  - Цвет (HEX формат, с палитрой предустановленных цветов)
  - Порядок (автоматическое назначение или ручное)
- **CRUD вопросов**: Возможность создавать, редактировать, удалять и дублировать вопросы с полями:
  - Стоимость (обязательное, уникальное в рамках категории)
  - Текст вопроса (обязательное, до 1000 символов)
  - Ответ (обязательное, до 500 символов)
  - Порядок (автоматическое назначение или ручное)
- **Переупорядочивание**: Возможность изменять порядок категорий и вопросов с помощью кнопок "вверх/вниз".
- **Валидация**: Клиентская и серверная валидация всех полей, проверка уникальности стоимости вопросов в категории.
- **Лимиты плана**: Проверка и отображение лимитов плана для количества категорий и вопросов.
- **Каскадное удаление**: При удалении категории автоматически удаляются все её вопросы с подтверждением.
- **Права доступа**: Только пользователи с ролью `Admin` или `Owner` могут управлять контентом игры.

## Технические детали реализации

### API слой

#### Categories API (`src/shared/categoriesApi.ts`)
- **`getCategories(gameId: string): Promise<Category[]>`**: Получение всех категорий игры, отсортированных по порядку.
- **`getCategory(categoryId: string): Promise<Category>`**: Получение одной категории по ID.
- **`createCategory(gameId: string, categoryData: CreateCategoryRequest): Promise<Category>`**: Создание новой категории с автоматическим назначением порядка.
- **`updateCategory(categoryId: string, categoryData: UpdateCategoryRequest): Promise<Category>`**: Обновление существующей категории.
- **`deleteCategory(categoryId: string): Promise<void>`**: Удаление категории и всех её вопросов (каскадное удаление).
- **`reorderCategories(gameId: string, reorderData: ReorderCategoriesRequest): Promise<Category[]>`**: Изменение порядка категорий.
- **`duplicateCategory(categoryId: string, newName?: string): Promise<Category>`**: Дублирование категории со всеми вопросами.
- **`checkCategoryLimits(gameId: string): Promise<{current: number, max: number, canCreate: boolean}>`**: Проверка лимитов плана для категорий.

#### Questions API (`src/shared/questionsApi.ts`)
- **`getQuestions(categoryId: string): Promise<Question[]>`**: Получение всех вопросов категории.
- **`getQuestionsByGame(gameId: string): Promise<Question[]>`**: Получение всех вопросов игры.
- **`getQuestion(questionId: string): Promise<Question>`**: Получение одного вопроса по ID.
- **`createQuestion(categoryId: string, questionData: CreateQuestionRequest): Promise<Question>`**: Создание нового вопроса с валидацией уникальности стоимости.
- **`updateQuestion(questionId: string, questionData: UpdateQuestionRequest): Promise<Question>`**: Обновление существующего вопроса.
- **`deleteQuestion(questionId: string): Promise<void>`**: Удаление вопроса.
- **`moveQuestion(questionId: string, moveData: MoveQuestionRequest): Promise<Question>`**: Перемещение вопроса в другую категорию.
- **`reorderQuestions(categoryId: string, questionIds: string[]): Promise<Question[]>`**: Изменение порядка вопросов в категории.
- **`duplicateQuestion(questionId: string, targetCategoryId?: string): Promise<Question>`**: Дублирование вопроса с уникальной стоимостью.
- **`checkQuestionLimits(gameId: string): Promise<{current: number, max: number, canCreate: boolean}>`**: Проверка лимитов плана для вопросов.

### React Hooks

#### Categories Hooks (`src/shared/useCategories.ts`)
- **`useCategories(gameId: string | null)`**: Хук для управления категориями игры.
  - Предоставляет: `categories`, `isLoading`, `error`, `limits`
  - Методы: `loadCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `duplicateCategory`, `checkLimits`
- **`useCategory(categoryId: string | null)`**: Хук для работы с одной категорией.

#### Questions Hooks (`src/shared/useQuestions.ts`)
- **`useQuestions(categoryId: string | null)`**: Хук для управления вопросами категории.
- **`useQuestionsByGame(gameId: string | null)`**: Хук для получения всех вопросов игры с лимитами.
- **`useQuestion(questionId: string | null)`**: Хук для работы с одним вопросом.

### UI Компоненты

#### Category Components
- **`src/components/CategoryCard.tsx`**: Карточка категории с информацией и кнопками действий.
  - Отображает: название, цвет, количество вопросов, порядок
  - Действия: Edit, Duplicate, Delete, Move Up/Down
- **`src/components/CategoryForm.tsx`**: Форма создания/редактирования категории.
  - Поля: название, цвет (с палитрой), порядок
  - Валидация: обязательные поля, длина текста, формат цвета
  - Проверка лимитов плана

#### Question Components
- **`src/components/QuestionCard.tsx`**: Карточка вопроса с информацией и действиями.
  - Отображает: стоимость, текст, ответ, статус (Available/Locked/Done), порядок
  - Действия: Edit, Duplicate, Delete, Move Up/Down
- **`src/components/QuestionForm.tsx`**: Форма создания/редактирования вопроса.
  - Поля: стоимость (с предустановленными значениями), текст, ответ, порядок
  - Валидация: обязательные поля, длина текста, уникальность стоимости

#### Main Editor
- **`src/pages/GameEditor.tsx`**: Главная страница редактора игры.
  - Двухпанельный интерфейс: категории слева, вопросы справа
  - Модальные окна для форм создания/редактирования
  - Отображение лимитов плана
  - Интеграция с системой прав доступа

### Типы данных (`src/shared/types/index.ts`)

```typescript
// Category types
export interface Category {
  id: string
  gameId: string
  name: string
  color?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  color?: string
  order?: number
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
  order?: number
}

// Question types
export interface Question {
  id: string
  categoryId: string
  value: number
  text: string
  answer: string
  order: number
  isLocked: boolean
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateQuestionRequest {
  value: number
  text: string
  answer: string
  order?: number
}

export interface UpdateQuestionRequest {
  value?: number
  text?: string
  answer?: string
  order?: number
}
```

### Роутинг (`src/App.tsx`)
- Добавлен маршрут `/org/:orgId/admin/games/:gameId/edit` для `GameEditor`
- Интеграция с существующей системой lazy loading

### Валидация

#### Категории
- Название: обязательное, 1-50 символов
- Цвет: опциональный, формат HEX (#RRGGBB)
- Порядок: положительное число

#### Вопросы
- Стоимость: обязательная, > 0, уникальная в категории
- Текст: обязательный, 1-1000 символов
- Ответ: обязательный, 1-500 символов
- Порядок: положительное число

### Лимиты плана
- **Free план**: до 5 категорий, до 25 вопросов
- **Pro план**: до 10 категорий, до 50 вопросов (конфигурируется в `plans.caps`)

### Особенности реализации
- **Каскадное удаление**: При удалении категории все вопросы удаляются автоматически
- **Уникальность стоимости**: Проверяется на уровне API и UI
- **Переупорядочивание**: Реализовано через upsert с пересчетом порядка
- **Дублирование**: Создает копии с уникальными именами/стоимостями
- **Обработка ошибок**: Все ошибки обрабатываются с пользовательскими сообщениями
- **TypeScript**: Строгая типизация без `any` типов

## Зависимости
- `react-router-dom` для навигации
- `supabase-js` для взаимодействия с API
- Существующие UI компоненты (`Button`, `Card`, `Modal`)
- Система аутентификации и авторизации

## Реализованные функции

### ✅ Завершено
- **CRUD категорий**: Создание, редактирование, удаление, дублирование категорий
- **CRUD вопросов**: Создание, редактирование, удаление, дублирование вопросов
- **Переупорядочивание**: Кнопки "вверх/вниз" для категорий и вопросов
- **Валидация**: Клиентская валидация всех полей
- **Лимиты плана**: Проверка и отображение лимитов для категорий и вопросов
- **Каскадное удаление**: При удалении категории удаляются все её вопросы
- **Права доступа**: Интеграция с системой ролей
- **Выбор категории**: Клик на категорию для отображения её вопросов
- **Просмотр игры**: Страница просмотра игры с категориями и вопросами
- **Жесткое удаление**: Кнопка Delete теперь удаляет игры навсегда

### 🔧 Исправленные проблемы
- **Фильтрация вопросов**: Исправлено несоответствие `categoryId` vs `category_id`
- **Тайминг аутентификации**: Добавлены проверки загрузки в GameEditor и GameViewPage
- **UI видимость**: Улучшена контрастность и читаемость интерфейса
- **RLS политики**: Упрощены политики безопасности для разработки
- **Типизация**: Исправлены все ошибки TypeScript и ESLint

## Дальнейшие шаги
- Реализация drag-and-drop для переупорядочивания
- Добавление массовых операций (импорт/экспорт)
- Интеграция с системой предпросмотра игры
- Расширение валидации и бизнес-логики
