import { describe, it, expect } from 'vitest'
import { parseJSONPack } from '../jsonParser'

describe('JSON Parser', () => {
  describe('parseJSONPack', () => {
    it('should parse valid JSON pack', () => {
      const jsonContent = JSON.stringify({
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
          },
          {
            name: 'Наука',
            questions: [
              {
                value: 200,
                text: 'Сколько костей в теле взрослого человека?',
                answer: '206'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(true)
      expect(result.pack).toBeDefined()
      expect(result.pack?.title).toBe('Тестовый пакет')
      expect(result.pack?.categories).toHaveLength(2)
      expect(result.pack?.categories?.[0]?.name).toBe('История')
      expect(result.pack?.categories?.[0]?.questions).toHaveLength(1)
      expect(result.pack?.categories?.[0]?.questions?.[0]?.value).toBe(100)
      expect(result.pack?.categories?.[0]?.questions?.[0]?.text).toBe('В каком году началась Вторая мировая война?')
      expect(result.pack?.categories?.[0]?.questions?.[0]?.answer).toBe('1939')
    })

    it('should validate required fields', () => {
      const jsonContent = JSON.stringify({
        // title missing
        categories: []
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть строкой') || e.message.includes('не может быть пустым'))).toBe(true)
    })

    it('should validate title length', () => {
      const longTitle = 'a'.repeat(101)
      const jsonContent = JSON.stringify({
        title: longTitle,
        categories: []
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 100 символов'))).toBe(true)
    })

    it('should validate categories array', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: 'not an array'
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть массивом'))).toBe(true)
    })

    it('should validate category name', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            // name missing
            questions: []
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть строкой') || e.message.includes('не может быть пустым'))).toBe(true)
    })

    it('should validate category name length', () => {
      const longName = 'a'.repeat(51)
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: longName,
            questions: []
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 50 символов'))).toBe(true)
    })

    it('should validate questions array', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: 'not an array'
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть массивом'))).toBe(true)
    })

    it('should validate question value', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 50, // too low
                text: 'Вопрос',
                answer: 'Ответ'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть меньше 100'))).toBe(true)
    })

    it('should validate question text', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 100,
                // text missing
                answer: 'Ответ'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть строкой') || e.message.includes('не может быть пустым'))).toBe(true)
    })

    it('should validate question text length', () => {
      const longText = 'a'.repeat(501)
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 100,
                text: longText,
                answer: 'Ответ'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 500 символов'))).toBe(true)
    })

    it('should validate answer text', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 100,
                text: 'Вопрос',
                // answer missing
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('должно быть строкой') || e.message.includes('не может быть пустым'))).toBe(true)
    })

    it('should validate answer text length', () => {
      const longAnswer = 'a'.repeat(201)
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 100,
                text: 'Вопрос',
                answer: longAnswer
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 200 символов'))).toBe(true)
    })

    it('should detect duplicate category-value pairs', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 100,
                text: 'Первый вопрос',
                answer: 'Ответ 1'
              },
              {
                value: 100,
                text: 'Дублирующий вопрос',
                answer: 'Ответ 2'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('дублирующиеся стоимости'))).toBe(true)
    })

    it('should handle invalid JSON', () => {
      const result = parseJSONPack('invalid json')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Ошибка парсинга JSON'))).toBe(true)
    })

    it('should sort categories alphabetically', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'Зоология',
            questions: [
              {
                value: 100,
                text: 'Вопрос о животных',
                answer: 'Ответ'
              }
            ]
          },
          {
            name: 'Астрономия',
            questions: [
              {
                value: 100,
                text: 'Вопрос о звездах',
                answer: 'Ответ'
              }
            ]
          },
          {
            name: 'Биология',
            questions: [
              {
                value: 100,
                text: 'Вопрос о жизни',
                answer: 'Ответ'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(true)
      expect(result.pack?.categories?.[0]?.name).toBe('Астрономия')
      expect(result.pack?.categories?.[1]?.name).toBe('Биология')
      expect(result.pack?.categories?.[2]?.name).toBe('Зоология')
    })

    it('should sort questions by value within categories', () => {
      const jsonContent = JSON.stringify({
        title: 'Тестовый пакет',
        categories: [
          {
            name: 'История',
            questions: [
              {
                value: 300,
                text: 'Третий вопрос',
                answer: 'Ответ'
              },
              {
                value: 100,
                text: 'Первый вопрос',
                answer: 'Ответ'
              },
              {
                value: 200,
                text: 'Второй вопрос',
                answer: 'Ответ'
              }
            ]
          }
        ]
      })

      const result = parseJSONPack(jsonContent)

      expect(result.isValid).toBe(true)
      expect(result.pack?.categories?.[0]?.questions?.[0]?.value).toBe(100)
      expect(result.pack?.categories?.[0]?.questions?.[1]?.value).toBe(200)
      expect(result.pack?.categories?.[0]?.questions?.[2]?.value).toBe(300)
    })
  })
})
