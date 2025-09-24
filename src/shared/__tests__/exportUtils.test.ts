import { describe, it, expect, vi } from 'vitest'
import { exportToCSV, generateExportFilename, ExportData } from '../exportUtils'

// Мокаем downloadCSV, так как он использует DOM API
vi.mock('../exportUtils', async () => {
  const actual = await vi.importActual('../exportUtils')
  return {
    ...actual,
    downloadCSV: vi.fn(),
  }
})

describe('exportUtils', () => {
  const mockExportData: ExportData = {
    scoreEvents: [
      {
        id: 'score-1',
        gameId: 'demo-game',
        teamId: 'team-1',
        questionId: 'q-1-1',
        delta: 100,
        createdAt: '2024-01-01T10:00:00.000Z',
      },
      {
        id: 'score-2',
        gameId: 'demo-game',
        teamId: 'team-2',
        questionId: 'q-1-2',
        delta: -200,
        createdAt: '2024-01-01T10:05:00.000Z',
      },
    ],
    teams: [
      { id: 'team-1', gameId: 'demo-game', name: 'Команда 1', color: '#EF4444', order: 1, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
      { id: 'team-2', gameId: 'demo-game', name: 'Команда 2', color: '#3B82F6', order: 2, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ],
    questions: [
      {
        id: 'q-1-1',
        categoryId: 'cat-1',
        value: 100,
        text: 'В каком году началась Вторая мировая война?',
        answer: '1939',
        order: 1,
        isLocked: false,
        isDone: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 'q-1-2',
        categoryId: 'cat-1',
        value: 200,
        text: 'Кто был первым президентом США?',
        answer: 'Джордж Вашингтон',
        order: 2,
        isLocked: false,
        isDone: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ],
    gameTitle: 'Демо-игра Jeopardy',
    exportDate: '2024-01-01T12:00:00.000Z',
  }

  describe('exportToCSV', () => {
    it('should generate CSV with correct headers', () => {
      const csv = exportToCSV(mockExportData)
      
      expect(csv).toContain('Время')
      expect(csv).toContain('ID Вопроса')
      expect(csv).toContain('Текст Вопроса')
      expect(csv).toContain('Стоимость')
      expect(csv).toContain('ID Команды')
      expect(csv).toContain('Название Команды')
      expect(csv).toContain('Дельта')
      expect(csv).toContain('Правильный Ответ')
    })

    it('should include metadata in CSV', () => {
      const csv = exportToCSV(mockExportData)
      
      expect(csv).toContain('# Экспорт результатов игры: Демо-игра Jeopardy')
      expect(csv).toContain('# Дата экспорта: 2024-01-01T12:00:00.000Z')
      expect(csv).toContain('# Всего событий: 2')
      expect(csv).toContain('# Всего команд: 2')
    })

    it('should include score events data', () => {
      const csv = exportToCSV(mockExportData)
      
      expect(csv).toContain('2024-01-01T10:00:00.000Z')
      expect(csv).toContain('q-1-1')
      expect(csv).toContain('В каком году началась Вторая мировая война?')
      expect(csv).toContain('100')
      expect(csv).toContain('team-1')
      expect(csv).toContain('Команда 1')
      expect(csv).toContain('100')
      expect(csv).toContain('1939')
    })

    it('should handle negative deltas', () => {
      const csv = exportToCSV(mockExportData)
      
      expect(csv).toContain('-200')
      expect(csv).toContain('Команда 2')
    })

    it('should sort events by time', () => {
      const csv = exportToCSV(mockExportData)
      const lines = csv.split('\n')
      
      // Находим строки с данными (после заголовков)
      const dataLines = lines.filter(line => 
        line.includes('2024-01-01T10:') && !line.startsWith('#')
      )
      
      expect(dataLines[0]).toContain('2024-01-01T10:00:00.000Z')
      expect(dataLines[1]).toContain('2024-01-01T10:05:00.000Z')
    })

    it('should handle missing team or question data', () => {
      const dataWithMissing = {
        ...mockExportData,
        scoreEvents: [
          {
            id: 'score-3',
            gameId: 'demo-game',
            teamId: 'team-unknown',
            questionId: 'q-unknown',
            delta: 50,
            createdAt: '2024-01-01T10:10:00.000Z',
          },
        ],
      }
      
      const csv = exportToCSV(dataWithMissing)
      
      expect(csv).toContain('team-unknown')
      expect(csv).toContain('Неизвестная команда')
      expect(csv).toContain('q-unknown')
      expect(csv).toContain('Неизвестный вопрос')
      expect(csv).toContain('Неизвестный ответ')
    })
  })

  describe('generateExportFilename', () => {
    it('should generate filename with game title and date', () => {
      const filename = generateExportFilename('Демо-игра Jeopardy', '2024-01-01T12:00:00.000Z')
      
      expect(filename).toContain('jeopardy_')
      expect(filename).toContain('Демоигра_Jeopardy') // Дефис удаляется при очистке
      expect(filename).toContain('2024-01-01')
      expect(filename).toContain('.csv')
    })

    it('should clean special characters from game title', () => {
      const filename = generateExportFilename('Test Game!@#$%^&*()', '2024-01-01T12:00:00.000Z')
      
      expect(filename).toContain('Test_Game')
      expect(filename).not.toContain('!@#$%^&*()')
    })

    it('should handle empty game title', () => {
      const filename = generateExportFilename('', '2024-01-01T12:00:00.000Z')
      
      expect(filename).toContain('jeopardy__2024-01-01')
      expect(filename).toContain('.csv')
    })

    it('should format time correctly', () => {
      const filename = generateExportFilename('Test', '2024-01-01T12:30:45.000Z')
      
      // Время может отображаться в разных timezone, поэтому проверяем только формат
      expect(filename).toMatch(/\d{2}-\d{2}-\d{2}/)
    })
  })
})
