import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  addPackToLibrary, 
  getAllPacksFromLibrary, 
  removePackFromLibrary, 
  getPackFromLibrary,
  clearPackLibrary 
} from '../packLibrary'
import type { QuestionPack } from '../types/packTypes'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('Pack Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {}) // Reset to normal behavior
    localStorageMock.removeItem.mockImplementation(() => {}) // Reset to normal behavior
  })

  const mockPack: QuestionPack = {
    title: 'Тестовый пакет',
    categories: [
      {
        name: 'История',
        questions: [
          {
            value: 100,
            text: 'В каком году началась Вторая мировая война?',
            answer: '1939'
          }
        ]
      }
    ]
  }

  describe('addPackToLibrary', () => {
    it('should add pack to empty library', () => {
      expect(() => addPackToLibrary(mockPack)).not.toThrow()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jeopardy-pack-library',
        expect.stringContaining(mockPack.title)
      )
    })

    it('should add pack to existing library', () => {
      const existingLibrary = {
        packs: [
          { title: 'Существующий пакет', categories: [], createdAt: new Date().toISOString() }
        ],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      expect(() => addPackToLibrary(mockPack)).not.toThrow()
      
      const setItemCall = localStorageMock.setItem.mock.calls[0]
      const savedLibrary = JSON.parse(setItemCall?.[1] || '{}')
      expect(savedLibrary.packs).toHaveLength(2)
      expect(savedLibrary.packs[1].title).toBe(mockPack.title)
    })

    it('should handle localStorage errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => addPackToLibrary(mockPack)).toThrow('Не удалось сохранить библиотеку пакетов')
    })
  })

  describe('getAllPacksFromLibrary', () => {
    it('should return empty array for empty library', () => {
      const library = getAllPacksFromLibrary()
      expect(library).toEqual([])
    })

    it('should return existing library', () => {
      const existingLibrary = {
        packs: [mockPack],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      const library = getAllPacksFromLibrary()
      expect(library).toHaveLength(1)
      expect(library[0]?.title).toBe(mockPack.title)
    })

    it('should handle corrupted library data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const library = getAllPacksFromLibrary()
      expect(library).toEqual([])
    })
  })

  describe('removePackFromLibrary', () => {
    it('should remove pack from library', () => {
      const existingLibrary = {
        packs: [mockPack],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      expect(() => removePackFromLibrary(mockPack.title)).not.toThrow()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jeopardy-pack-library',
        expect.stringContaining('"packs":[]')
      )
    })

    it('should handle non-existent pack', () => {
      const existingLibrary = {
        packs: [mockPack],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      expect(() => removePackFromLibrary('non-existent-title')).not.toThrow()
    })

    it('should handle localStorage errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => removePackFromLibrary(mockPack.title)).toThrow('Не удалось сохранить библиотеку пакетов')
    })
  })

  describe('getPackFromLibrary', () => {
    it('should return pack by title', () => {
      const existingLibrary = {
        packs: [mockPack],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      const pack = getPackFromLibrary(mockPack.title)

      expect(pack).toBeDefined()
      expect(pack?.title).toBe(mockPack.title)
    })

    it('should return undefined for non-existent pack', () => {
      const existingLibrary = {
        packs: [mockPack],
        lastUpdated: new Date().toISOString()
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLibrary))

      const pack = getPackFromLibrary('non-existent-title')

      expect(pack).toBeUndefined()
    })
  })

  describe('clearPackLibrary', () => {
    it('should clear library', () => {
      expect(() => clearPackLibrary()).not.toThrow()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('jeopardy-pack-library')
    })

    it('should handle localStorage errors', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearPackLibrary()).toThrow('Storage error')
    })
  })
})
