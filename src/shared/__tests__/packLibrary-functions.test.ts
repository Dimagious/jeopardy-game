import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createPackPreview, 
  exportPackToJSON, 
  exportPackToCSV,
  getLibraryStats
} from '../packLibrary'
import { QuestionPack } from '../types/packTypes'

describe('Pack Library Functions', () => {
  const mockPack: QuestionPack = {
    title: 'Test Pack',
    categories: [
      {
        name: 'History',
        questions: [
          { value: 100, text: 'Question 1?', answer: 'Answer 1' },
          { value: 200, text: 'Question 2?', answer: 'Answer 2' }
        ]
      },
      {
        name: 'Science',
        questions: [
          { value: 100, text: 'Science question?', answer: 'Science answer' }
        ]
      }
    ]
  }

  describe('createPackPreview', () => {
    it('should create correct preview for pack', () => {
      const preview = createPackPreview(mockPack)
      
      expect(preview.title).toBe('Test Pack')
      expect(preview.categoryCount).toBe(2)
      expect(preview.questionCount).toBe(3)
      expect(preview.totalValue).toBe(400) // 100 + 200 + 100
      expect(preview.categories).toHaveLength(2)
      
      expect(preview.categories[0]).toEqual({
        name: 'History',
        questionCount: 2,
        values: [100, 200]
      })
      
      expect(preview.categories[1]).toEqual({
        name: 'Science',
        questionCount: 1,
        values: [100]
      })
    })

    it('should handle empty pack', () => {
      const emptyPack: QuestionPack = {
        title: 'Empty Pack',
        categories: []
      }
      
      const preview = createPackPreview(emptyPack)
      
      expect(preview.title).toBe('Empty Pack')
      expect(preview.categoryCount).toBe(0)
      expect(preview.questionCount).toBe(0)
      expect(preview.totalValue).toBe(0)
      expect(preview.categories).toHaveLength(0)
    })

    it('should sort question values correctly', () => {
      const unsortedPack: QuestionPack = {
        title: 'Unsorted Pack',
        categories: [
          {
            name: 'Test',
            questions: [
              { value: 300, text: 'Question 3?', answer: 'Answer 3' },
              { value: 100, text: 'Question 1?', answer: 'Answer 1' },
              { value: 200, text: 'Question 2?', answer: 'Answer 2' }
            ]
          }
        ]
      }
      
      const preview = createPackPreview(unsortedPack)
      
      expect(preview.categories[0]?.values).toEqual([100, 200, 300])
    })
  })

  describe('exportPackToJSON', () => {
    it('should export pack to valid JSON', () => {
      const json = exportPackToJSON(mockPack)
      
      expect(() => JSON.parse(json)).not.toThrow()
      
      const parsed = JSON.parse(json)
      expect(parsed.title).toBe('Test Pack')
      expect(parsed.categories).toHaveLength(2)
      expect(parsed.categories[0].name).toBe('History')
      expect(parsed.categories[0].questions).toHaveLength(2)
    })

    it('should format JSON with proper indentation', () => {
      const json = exportPackToJSON(mockPack)
      
      // Should have newlines and spaces for formatting
      expect(json).toContain('\n')
      expect(json).toContain('  ') // 2-space indentation
    })
  })

  describe('exportPackToCSV', () => {
    it('should export pack to valid CSV format', () => {
      const csv = exportPackToCSV(mockPack)
      
      const lines = csv.split('\n')
      expect(lines[0]).toBe('Category,Value,Question,Answer')
      
      // Check that we have the right number of data lines
      expect(lines).toHaveLength(4) // header + 3 questions
      
      // Check first data line
      expect(lines[1]).toContain('History')
      expect(lines[1]).toContain('100')
      expect(lines[1]).toContain('Question 1?')
      expect(lines[1]).toContain('Answer 1')
    })

    it('should handle special characters in CSV', () => {
      const specialPack: QuestionPack = {
        title: 'Special Pack',
        categories: [
          {
            name: 'Test "Category"',
            questions: [
              { value: 100, text: 'Question with "quotes" and, commas?', answer: 'Answer with "quotes"' }
            ]
          }
        ]
      }
      
      const csv = exportPackToCSV(specialPack)
      
      // Should contain the data (exact escaping format may vary)
      expect(csv).toContain('Test "Category"')
      expect(csv).toContain('Question with "quotes" and, commas?')
      expect(csv).toContain('Answer with "quotes"')
      
      // Should be valid CSV format
      const lines = csv.split('\n')
      expect(lines[0]).toBe('Category,Value,Question,Answer')
      expect(lines).toHaveLength(2) // header + 1 question
    })

    it('should handle empty pack in CSV', () => {
      const emptyPack: QuestionPack = {
        title: 'Empty Pack',
        categories: []
      }
      
      const csv = exportPackToCSV(emptyPack)
      
      const lines = csv.split('\n')
      expect(lines[0]).toBe('Category,Value,Question,Answer')
      expect(lines).toHaveLength(1) // Only header
    })
  })

  describe('getLibraryStats', () => {
    // Mock localStorage for getLibraryStats
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }

    beforeEach(() => {
      vi.clearAllMocks()
      // Mock global localStorage
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
    })

    it('should calculate correct statistics', () => {
      const mockLibrary = {
        packs: [mockPack],
        lastUpdated: '2024-01-01T00:00:00.000Z'
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockLibrary))
      
      const stats = getLibraryStats()
      
      expect(stats.totalPacks).toBe(1)
      expect(stats.totalQuestions).toBe(3)
      expect(stats.totalCategories).toBe(2)
      expect(stats.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle empty library', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const stats = getLibraryStats()
      
      expect(stats.totalPacks).toBe(0)
      expect(stats.totalQuestions).toBe(0)
      expect(stats.totalCategories).toBe(0)
      expect(stats.lastUpdated).toBeDefined()
    })

    it('should handle corrupted library data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      const stats = getLibraryStats()
      
      expect(stats.totalPacks).toBe(0)
      expect(stats.totalQuestions).toBe(0)
      expect(stats.totalCategories).toBe(0)
      expect(stats.lastUpdated).toBeDefined()
    })
  })
})
