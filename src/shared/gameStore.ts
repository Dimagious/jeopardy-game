import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, Team, Category, Question, ScoreEvent, GameState } from './types'
import { GameEvent, createGameEvent } from './events'
import { analytics } from './analytics'
import { exportToCSV, downloadCSV, generateExportFilename, ExportData } from './exportUtils'

// Интерфейс для снапшота игры
interface GameSnapshot {
  game: Game | null
  categories: Category[]
  questions: Question[]
  teams: Team[]
  scoreEvents: ScoreEvent[]
  gameState: GameState | null
  lastSaved: number
}

// Демо-данные для тестирования
const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', gameId: 'demo-game', name: 'История', order: 1 },
  { id: 'cat-2', gameId: 'demo-game', name: 'Наука', order: 2 },
  { id: 'cat-3', gameId: 'demo-game', name: 'Спорт', order: 3 },
  { id: 'cat-4', gameId: 'demo-game', name: 'Кино', order: 4 },
  { id: 'cat-5', gameId: 'demo-game', name: 'География', order: 5 },
]

const DEMO_QUESTIONS: Question[] = [
  // История
  { id: 'q-1-1', categoryId: 'cat-1', value: 100, text: 'В каком году началась Вторая мировая война?', answer: '1939', order: 1, isLocked: false, isDone: false },
  { id: 'q-1-2', categoryId: 'cat-1', value: 200, text: 'Кто был первым президентом США?', answer: 'Джордж Вашингтон', order: 2, isLocked: false, isDone: false },
  { id: 'q-1-3', categoryId: 'cat-1', value: 300, text: 'В каком году пала Берлинская стена?', answer: '1989', order: 3, isLocked: false, isDone: false },
  { id: 'q-1-4', categoryId: 'cat-1', value: 400, text: 'Кто написал "Войну и мир"?', answer: 'Лев Толстой', order: 4, isLocked: false, isDone: false },
  { id: 'q-1-5', categoryId: 'cat-1', value: 500, text: 'В каком году произошла Октябрьская революция?', answer: '1917', order: 5, isLocked: false, isDone: false },
  
  // Наука
  { id: 'q-2-1', categoryId: 'cat-2', value: 100, text: 'Какая планета ближайшая к Солнцу?', answer: 'Меркурий', order: 1, isLocked: false, isDone: false },
  { id: 'q-2-2', categoryId: 'cat-2', value: 200, text: 'Сколько костей в теле взрослого человека?', answer: '206', order: 2, isLocked: false, isDone: false },
  { id: 'q-2-3', categoryId: 'cat-2', value: 300, text: 'Какой газ составляет 78% атмосферы Земли?', answer: 'Азот', order: 3, isLocked: false, isDone: false },
  { id: 'q-2-4', categoryId: 'cat-2', value: 400, text: 'Кто открыл закон всемирного тяготения?', answer: 'Исаак Ньютон', order: 4, isLocked: false, isDone: false },
  { id: 'q-2-5', categoryId: 'cat-2', value: 500, text: 'Какой элемент имеет символ Au?', answer: 'Золото', order: 5, isLocked: false, isDone: false },
  
  // Спорт
  { id: 'q-3-1', categoryId: 'cat-3', value: 100, text: 'В каком году проходили Олимпийские игры в Москве?', answer: '1980', order: 1, isLocked: false, isDone: false },
  { id: 'q-3-2', categoryId: 'cat-3', value: 200, text: 'Сколько игроков в команде по футболу?', answer: '11', order: 2, isLocked: false, isDone: false },
  { id: 'q-3-3', categoryId: 'cat-3', value: 300, text: 'Кто выиграл чемпионат мира по футболу 2018?', answer: 'Франция', order: 3, isLocked: false, isDone: false },
  { id: 'q-3-4', categoryId: 'cat-3', value: 400, text: 'В каком виде спорта используется ракетка?', answer: 'Теннис', order: 4, isLocked: false, isDone: false },
  { id: 'q-3-5', categoryId: 'cat-3', value: 500, text: 'Кто является рекордсменом по количеству золотых медалей Олимпиады?', answer: 'Майкл Фелпс', order: 5, isLocked: false, isDone: false },
  
  // Кино
  { id: 'q-4-1', categoryId: 'cat-4', value: 100, text: 'Кто снял фильм "Криминальное чтиво"?', answer: 'Квентин Тарантино', order: 1, isLocked: false, isDone: false },
  { id: 'q-4-2', categoryId: 'cat-4', value: 200, text: 'В каком году вышел фильм "Титаник"?', answer: '1997', order: 2, isLocked: false, isDone: false },
  { id: 'q-4-3', categoryId: 'cat-4', value: 300, text: 'Кто играл главную роль в "Форресте Гампе"?', answer: 'Том Хэнкс', order: 3, isLocked: false, isDone: false },
  { id: 'q-4-4', categoryId: 'cat-4', value: 400, text: 'Какой фильм получил Оскар за лучший фильм в 2020?', answer: 'Паразиты', order: 4, isLocked: false, isDone: false },
  { id: 'q-4-5', categoryId: 'cat-4', value: 500, text: 'Кто режиссер фильма "Криминальное чтиво"?', answer: 'Квентин Тарантино', order: 5, isLocked: false, isDone: false },
  
  // География
  { id: 'q-5-1', categoryId: 'cat-5', value: 100, text: 'Какая самая длинная река в мире?', answer: 'Нил', order: 1, isLocked: false, isDone: false },
  { id: 'q-5-2', categoryId: 'cat-5', value: 200, text: 'В какой стране находится Эйфелева башня?', answer: 'Франция', order: 2, isLocked: false, isDone: false },
  { id: 'q-5-3', categoryId: 'cat-5', value: 300, text: 'Какая столица Австралии?', answer: 'Канберра', order: 3, isLocked: false, isDone: false },
  { id: 'q-5-4', categoryId: 'cat-5', value: 400, text: 'Сколько континентов на Земле?', answer: '7', order: 4, isLocked: false, isDone: false },
  { id: 'q-5-5', categoryId: 'cat-5', value: 500, text: 'Какая самая высокая гора в мире?', answer: 'Эверест', order: 5, isLocked: false, isDone: false },
]

const DEMO_TEAMS: Team[] = [
  { id: 'team-1', gameId: 'demo-game', name: 'Команда 1', order: 1 },
  { id: 'team-2', gameId: 'demo-game', name: 'Команда 2', order: 2 },
  { id: 'team-3', gameId: 'demo-game', name: 'Команда 3', order: 3 },
]

const DEMO_GAME: Game = {
  id: 'demo-game',
  orgId: 'demo-org',
  title: 'Демо-игра Jeopardy',
  status: 'active',
  createdBy: 'demo-user',
  createdAt: new Date().toISOString(),
}

// Типы режимов игры
export type GameMode = 'jeopardy' | 'buzzer'

// Интерфейс для локального хранилища игры
interface GameStore {
  // Данные игры
  game: Game | null
  categories: Category[]
  questions: Question[]
  teams: Team[]
  scoreEvents: ScoreEvent[]
  
  // Состояние игры
  gameState: GameState | null
  
  // Режим игры
  gameMode: GameMode | null
  
  // Действия
  initializeGame: (gameId: string) => void
  selectQuestion: (questionId: string) => void
  toggleAnswer: () => void
  judgeAnswer: (teamId: string, correct: boolean) => void
  selectTeam: (teamId: string) => void
  resetGame: () => void
  exportResults: () => void
  
  // Управление режимами
  setGameMode: (mode: GameMode) => void
  getGameMode: (gameId: string) => GameMode | null
  
  // Управление командами игроков (для Buzzer Mode)
  getPlayersByTeam: (teamId: string) => unknown[]
  getTeamPlayerCount: (teamId: string) => number
  getPlayerTeamScore: (teamId: string) => number
  
  // Утилиты
  getQuestionById: (id: string) => Question | undefined
  getCategoryById: (id: string) => Category | undefined
  getTeamById: (id: string) => Team | undefined
  getTeamScore: (teamId: string) => number
  isQuestionAvailable: (questionId: string) => boolean
  
  // Снапшоты состояния
  hasActiveGame: () => boolean
  getGameSnapshot: () => GameSnapshot
  restoreGameSnapshot: (snapshot: GameSnapshot) => void
  clearGame: () => void
  createAutoSnapshot: () => void
  
  // Управление состоянием
  resetCurrentQuestion: () => void
}

// Функция для принудительной синхронизации с экраном
const forceSyncToScreen = (getState: () => GameStore) => {
  setTimeout(() => {
    const currentState = getState()
    const storeData = {
      state: {
        game: currentState.game,
        categories: currentState.categories,
        questions: currentState.questions,
        teams: currentState.teams,
        scoreEvents: currentState.scoreEvents,
        gameState: currentState.gameState,
      },
      version: Date.now()
    }
    
    // Принудительно обновляем localStorage (только в браузере)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('jeopardy-game-store', JSON.stringify(storeData))
      
      // Отправляем событие storage для синхронизации экрана
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'jeopardy-game-store',
        newValue: JSON.stringify(storeData),
        oldValue: localStorage.getItem('jeopardy-game-store'),
        storageArea: localStorage
      }))
    }
  }, 50)
}

// Локальная шина событий (мок Realtime)
class LocalEventBus {
  private listeners: Map<string, ((event: GameEvent) => void)[]> = new Map()

  subscribe(gameId: string, callback: (event: GameEvent) => void) {
    const key = `game:${gameId}`
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(callback)
  }

  unsubscribe(gameId: string, callback: (event: GameEvent) => void) {
    const key = `game:${gameId}`
    const listeners = this.listeners.get(key)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  publish(event: GameEvent) {
    const key = `game:${event.gameId}`
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => callback(event))
    }
  }
}

// Глобальная шина событий
export const eventBus = new LocalEventBus()

// Создаем Zustand store
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      game: null,
      categories: [],
      questions: [],
      teams: [],
      scoreEvents: [],
      gameState: null,
      gameMode: null,

      // Инициализация игры
      initializeGame: (gameId: string) => {
        if (gameId === 'demo-game') {
          set({
            game: DEMO_GAME,
            categories: DEMO_CATEGORIES,
            questions: DEMO_QUESTIONS,
            teams: DEMO_TEAMS,
            scoreEvents: [],
            gameState: {
              gameId,
              currentQuestion: null,
              selectedTeam: null,
              isQuestionOpen: false,
              lastUpdated: Date.now(),
            },
          })
          analytics.gameStart(gameId)
        }
      },

      // Выбор вопроса
      selectQuestion: (questionId: string) => {
        const { questions, gameState, game } = get()
        const question = questions.find(q => q.id === questionId)
        
        if (!question || !gameState || !game) return
        
        // Проверяем, доступен ли вопрос
        if (question.isDone || question.isLocked) return

        // Обновляем состояние
        const newGameState: GameState = {
          ...gameState,
          currentQuestion: {
            id: question.id,
            categoryId: question.categoryId,
            value: question.value,
            text: question.text,
            answer: question.answer,
            showAnswer: false,
          },
          isQuestionOpen: true,
          lastUpdated: Date.now(),
        }

        set({ gameState: newGameState })

        // Принудительно синхронизируем с экраном
        forceSyncToScreen(get)

        // Создаем автоснапшот
        get().createAutoSnapshot()

        // Публикуем событие
        const event = createGameEvent.boardSelect(
          game.id,
          question.id,
          question.categoryId,
          question.value
        )
        eventBus.publish(event)
        analytics.boardSelect(game.id, question.id)
      },

      // Показать/скрыть ответ
      toggleAnswer: () => {
        const { gameState, game } = get()
        if (!gameState?.currentQuestion || !game) return

        const newShowAnswer = !gameState.currentQuestion.showAnswer
        const newGameState: GameState = {
          ...gameState,
          currentQuestion: {
            ...gameState.currentQuestion,
            showAnswer: newShowAnswer,
          },
          lastUpdated: Date.now(),
        }

        set({ gameState: newGameState })

        // Принудительно синхронизируем с экраном
        forceSyncToScreen(get)

        // Публикуем событие
        const event = createGameEvent.answerToggle(
          game.id,
          gameState.currentQuestion.id,
          newShowAnswer
        )
        eventBus.publish(event)
      },

      // Судейство ответа
      judgeAnswer: (teamId: string, correct: boolean) => {
        const { gameState, game, questions, scoreEvents } = get()
        if (!gameState?.currentQuestion || !game) return

        const question = questions.find(q => q.id === gameState.currentQuestion!.id)
        if (!question) return

        const delta = correct ? question.value : -question.value
        const newScoreEvent: ScoreEvent = {
          id: `score-${Date.now()}`,
          gameId: game.id,
          teamId,
          questionId: question.id,
          delta,
          createdAt: new Date().toISOString(),
        }

        // Обновляем вопрос как завершенный
        const updatedQuestions = questions.map(q =>
          q.id === question.id ? { ...q, isDone: true } : q
        )

        // Сбрасываем состояние игры
        const newGameState: GameState = {
          ...gameState,
          currentQuestion: null,
          selectedTeam: null,
          isQuestionOpen: false,
          lastUpdated: Date.now(),
        }

        set({
          questions: updatedQuestions,
          scoreEvents: [...scoreEvents, newScoreEvent],
          gameState: newGameState,
        })

        // Создаем автоснапшот
        get().createAutoSnapshot()

        // Публикуем события
        const judgeEvent = createGameEvent.judge(
          game.id,
          question.id,
          teamId,
          correct,
          delta
        )
        const lockEvent = createGameEvent.lock(game.id, question.id)
        
        eventBus.publish(judgeEvent)
        eventBus.publish(lockEvent)
        analytics.judge(game.id, question.id, teamId, correct, delta)
      },

      // Выбор команды
      selectTeam: (teamId: string) => {
        const { gameState } = get()
        if (!gameState) return

        const newGameState: GameState = {
          ...gameState,
          selectedTeam: teamId,
          lastUpdated: Date.now(),
        }

        set({ gameState: newGameState })
      },

      // Сброс игры
      resetGame: () => {
        set({
          game: null,
          categories: [],
          questions: [],
          teams: [],
          scoreEvents: [],
          gameState: null,
        })
      },

      // Экспорт результатов
      exportResults: () => {
        const { game, scoreEvents, teams, questions } = get()
        
        if (!game || scoreEvents.length === 0) {
          console.warn('Нет данных для экспорта')
          return
        }

        const exportDate = new Date().toISOString()
        const exportData: ExportData = {
          scoreEvents,
          teams,
          questions,
          gameTitle: game.title,
          exportDate,
        }

        const csvContent = exportToCSV(exportData)
        const filename = generateExportFilename(game.title, exportDate)
        
        downloadCSV(csvContent, filename)
        
        // Отправляем аналитику
        analytics.exportResults(game.id, scoreEvents.length)
      },

      // Утилиты
      getQuestionById: (id: string) => {
        return get().questions.find(q => q.id === id)
      },

      getCategoryById: (id: string) => {
        return get().categories.find(c => c.id === id)
      },

      getTeamById: (id: string) => {
        return get().teams.find(t => t.id === id)
      },

      getTeamScore: (teamId: string) => {
        return get().scoreEvents
          .filter(e => e.teamId === teamId)
          .reduce((sum, e) => sum + e.delta, 0)
      },

      isQuestionAvailable: (questionId: string) => {
        const question = get().questions.find(q => q.id === questionId)
        return question ? !question.isDone && !question.isLocked : false
      },

      // Снапшоты состояния
      hasActiveGame: () => {
        const state = get()
        return state.game !== null && state.gameState !== null
      },

      getGameSnapshot: () => {
        const state = get()
        return {
          game: state.game,
          categories: state.categories,
          questions: state.questions,
          teams: state.teams,
          scoreEvents: state.scoreEvents,
          gameState: state.gameState,
          lastSaved: Date.now(),
        }
      },

      restoreGameSnapshot: (snapshot: GameSnapshot) => {
        set({
          game: snapshot.game,
          categories: snapshot.categories,
          questions: snapshot.questions,
          teams: snapshot.teams,
          scoreEvents: snapshot.scoreEvents,
          gameState: snapshot.gameState,
        })
      },

      clearGame: () => {
        set({
          game: null,
          categories: [],
          questions: [],
          teams: [],
          scoreEvents: [],
          gameState: null,
        })
      },

      // Сброс текущего вопроса (возврат к полю)
      resetCurrentQuestion: () => {
        set((state) => ({
          gameState: state.gameState ? {
            ...state.gameState,
            currentQuestion: null,
            selectedTeam: null,
            isQuestionOpen: false,
          } : null
        }))
        
        // Принудительно синхронизируем с экраном
        forceSyncToScreen(get)
      },

      // Автоснапшоты
      createAutoSnapshot: () => {
        const state = get()
        if (state.game && state.gameState) {
          const snapshot = {
            game: state.game,
            categories: state.categories,
            questions: state.questions,
            teams: state.teams,
            scoreEvents: state.scoreEvents,
            gameState: state.gameState,
            lastSaved: Date.now(),
          }
          
          // Сохраняем в localStorage для быстрого восстановления
          localStorage.setItem('jeopardy-game-snapshot', JSON.stringify(snapshot))
          
          // Отправляем событие для синхронизации экрана
          // eventBus.publish(createGameEvent('GAME_SNAPSHOT', { snapshot }))
        }
      },

      // Управление режимами
      setGameMode: (mode: GameMode) => {
        set({ gameMode: mode })
        
        // Принудительно синхронизируем с экраном
        forceSyncToScreen(get)
      },

      getGameMode: (gameId: string) => {
        // Сначала проверяем store
        const currentMode = get().gameMode
        if (currentMode) {
          return currentMode
        }

        // Затем проверяем localStorage
        const storedMode = localStorage.getItem(`jeopardy-game-mode-${gameId}`)
        if (storedMode && (storedMode === 'jeopardy' || storedMode === 'buzzer')) {
          set({ gameMode: storedMode as GameMode })
          return storedMode as GameMode
        }

        return null
      },

      // Управление командами игроков (для Buzzer Mode)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getPlayersByTeam: (_teamId: string) => {
        // Эта функция будет интегрирована с sessionStore
        // Пока возвращаем пустой массив
        return []
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getTeamPlayerCount: (_teamId: string) => {
        // Эта функция будет интегрирована с sessionStore
        // Пока возвращаем 0
        return 0
      },

      getPlayerTeamScore: (teamId: string) => {
        // Возвращаем очки команды (уже реализовано в getTeamScore)
        return get().getTeamScore(teamId)
      },
    }),
    {
      name: 'jeopardy-game-store',
      partialize: (state) => ({
        game: state.game,
        categories: state.categories,
        questions: state.questions,
        teams: state.teams,
        scoreEvents: state.scoreEvents,
        gameState: state.gameState,
        gameMode: state.gameMode,
      }),
    }
  )
)
