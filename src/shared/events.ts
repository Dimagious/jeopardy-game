// Realtime события для игры Jeopardy
// Канал: game:{gameId}

export type GameEventType = 
  | 'BOARD_SELECT'
  | 'ANSWER_TOGGLE'
  | 'JUDGE'
  | 'LOCK'
  | 'BUZZ'
  | 'ANSWER_SUBMIT'

// Базовый интерфейс для всех событий
export interface BaseGameEvent {
  type: GameEventType
  timestamp: number
  gameId: string
}

// Событие выбора ячейки на поле
export interface BoardSelectEvent extends BaseGameEvent {
  type: 'BOARD_SELECT'
  questionId: string
  categoryId: string
  value: number
}

// Событие показа/скрытия ответа
export interface AnswerToggleEvent extends BaseGameEvent {
  type: 'ANSWER_TOGGLE'
  questionId: string
  show: boolean
}

// Событие судейства (верно/неверно)
export interface JudgeEvent extends BaseGameEvent {
  type: 'JUDGE'
  questionId: string
  teamId: string
  correct: boolean
  delta: number
}

// Событие блокировки вопроса
export interface LockEvent extends BaseGameEvent {
  type: 'LOCK'
  questionId: string
}

// Событие нажатия кнопки "Я первый"
export interface BuzzEvent extends BaseGameEvent {
  type: 'BUZZ'
  playerId: string
  sessionId: string
  serverTimestamp: number
}

// Событие отправки ответа игроком
export interface AnswerSubmitEvent extends BaseGameEvent {
  type: 'ANSWER_SUBMIT'
  questionId: string
  playerId: string
  sessionId: string
  payload: {
    text?: string
    [key: string]: unknown
  }
}

// Объединенный тип всех событий
export type GameEvent = 
  | BoardSelectEvent
  | AnswerToggleEvent
  | JudgeEvent
  | LockEvent
  | BuzzEvent
  | AnswerSubmitEvent

// Утилиты для создания событий
export const createGameEvent = {
  boardSelect: (gameId: string, questionId: string, categoryId: string, value: number): BoardSelectEvent => ({
    type: 'BOARD_SELECT',
    timestamp: Date.now(),
    gameId,
    questionId,
    categoryId,
    value,
  }),

  answerToggle: (gameId: string, questionId: string, show: boolean): AnswerToggleEvent => ({
    type: 'ANSWER_TOGGLE',
    timestamp: Date.now(),
    gameId,
    questionId,
    show,
  }),

  judge: (gameId: string, questionId: string, teamId: string, correct: boolean, delta: number): JudgeEvent => ({
    type: 'JUDGE',
    timestamp: Date.now(),
    gameId,
    questionId,
    teamId,
    correct,
    delta,
  }),

  lock: (gameId: string, questionId: string): LockEvent => ({
    type: 'LOCK',
    timestamp: Date.now(),
    gameId,
    questionId,
  }),

  buzz: (gameId: string, playerId: string, sessionId: string, serverTimestamp: number): BuzzEvent => ({
    type: 'BUZZ',
    timestamp: Date.now(),
    gameId,
    playerId,
    sessionId,
    serverTimestamp,
  }),

  answerSubmit: (gameId: string, questionId: string, playerId: string, sessionId: string, payload: Record<string, unknown>): AnswerSubmitEvent => ({
    type: 'ANSWER_SUBMIT',
    timestamp: Date.now(),
    gameId,
    questionId,
    playerId,
    sessionId,
    payload,
  }),
}

// Тип-гард для проверки типа события
export const isGameEvent = (event: unknown): event is GameEvent => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    'timestamp' in event &&
    'gameId' in event &&
    typeof (event as GameEvent).type === 'string' &&
    typeof (event as GameEvent).timestamp === 'number' &&
    typeof (event as GameEvent).gameId === 'string'
  )
}

// Тип-гарды для конкретных событий
export const isBoardSelectEvent = (event: GameEvent): event is BoardSelectEvent => 
  event.type === 'BOARD_SELECT'

export const isAnswerToggleEvent = (event: GameEvent): event is AnswerToggleEvent => 
  event.type === 'ANSWER_TOGGLE'

export const isJudgeEvent = (event: GameEvent): event is JudgeEvent => 
  event.type === 'JUDGE'

export const isLockEvent = (event: GameEvent): event is LockEvent => 
  event.type === 'LOCK'

export const isBuzzEvent = (event: GameEvent): event is BuzzEvent => 
  event.type === 'BUZZ'

export const isAnswerSubmitEvent = (event: GameEvent): event is AnswerSubmitEvent => 
  event.type === 'ANSWER_SUBMIT'