import { describe, it, expect } from 'vitest'
import { createCSVTemplate } from '../csvParser'
import { createJSONTemplate } from '../jsonParser'

describe('Parser Utils', () => {
  describe('createCSVTemplate', () => {
    it('should create valid CSV template', () => {
      const template = createCSVTemplate()
      
      const lines = template.split('\n')
      expect(lines[0]).toBe('Category,Value,Question,Answer')
      expect(lines.length).toBeGreaterThan(1) // Should have header + example rows
      
      // Check that it's valid CSV format
      lines.slice(1).forEach(line => {
        if (line.trim()) {
          const columns = line.split(',')
          expect(columns).toHaveLength(4)
        }
      })
    })

    it('should include example data', () => {
      const template = createCSVTemplate()
      
      expect(template).toContain('История')
      expect(template).toContain('100')
      expect(template).toContain('В каком году')
      expect(template).toContain('1939')
    })

    it('should be valid CSV format', () => {
      const template = createCSVTemplate()
      
      // Should not throw when parsing as CSV
      const lines = template.split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          // Each line should have 4 comma-separated values
          const parts = line.split(',')
          expect(parts.length).toBeGreaterThanOrEqual(4)
        }
      })
    })
  })

  describe('createJSONTemplate', () => {
    it('should create valid JSON template', () => {
      const template = createJSONTemplate()
      
      expect(() => JSON.parse(template)).not.toThrow()
      
      const parsed = JSON.parse(template)
      expect(parsed).toHaveProperty('title')
      expect(parsed).toHaveProperty('categories')
      expect(Array.isArray(parsed.categories)).toBe(true)
    })

    it('should include example data', () => {
      const template = createJSONTemplate()
      const parsed = JSON.parse(template)
      
      expect(parsed.title).toBeDefined()
      expect(parsed.categories.length).toBeGreaterThan(0)
      
      if (parsed.categories.length > 0) {
        const category = parsed.categories[0]
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('questions')
        expect(Array.isArray(category.questions)).toBe(true)
        
        if (category.questions.length > 0) {
          const question = category.questions[0]
          expect(question).toHaveProperty('value')
          expect(question).toHaveProperty('text')
          expect(question).toHaveProperty('answer')
        }
      }
    })

    it('should be properly formatted JSON', () => {
      const template = createJSONTemplate()
      
      // Should have proper indentation
      expect(template).toContain('\n')
      expect(template).toContain('  ') // 2-space indentation
      
      // Should be valid JSON
      const parsed = JSON.parse(template)
      expect(typeof parsed).toBe('object')
    })
  })
})
