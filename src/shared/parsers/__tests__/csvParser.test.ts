import { describe, it, expect } from 'vitest'
import { parseCSVPack, createCSVTemplate } from '../csvParser'

describe('CSV Parser', () => {
  describe('parseCSVPack', () => {
    it('should parse valid CSV with correct headers', () => {
      const csvContent = `Category,Value,Question,Answer
"История",100,"В каком году началась Вторая мировая война?","1939"
"Наука",200,"Сколько костей в теле взрослого человека?","206"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(true)
      expect(result.pack).toBeDefined()
      expect(result.pack?.title).toBe('Тестовый пакет')
      expect(result.pack?.categories).toHaveLength(2)
      expect(result.pack?.categories[0].name).toBe('История')
      expect(result.pack?.categories[0].questions).toHaveLength(1)
      expect(result.pack?.categories[0].questions[0].value).toBe(100)
      expect(result.pack?.categories[0].questions[0].text).toBe('В каком году началась Вторая мировая война?')
      expect(result.pack?.categories[0].questions[0].answer).toBe('1939')
    })

    it('should handle CSV with quotes and commas in text', () => {
      const csvContent = `Category,Value,Question,Answer
"История",100,"Кто написал ""Войну и мир""?","Лев Толстой"
"Кино",200,"В каком году вышел фильм ""Титаник""?","1997"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(true)
      expect(result.pack?.categories[0].questions[0].text).toBe('Кто написал "Войну и мир"?')
      expect(result.pack?.categories[1].questions[0].text).toBe('В каком году вышел фильм "Титаник"?')
    })

    it('should validate CSV headers', () => {
      const csvContent = `Wrong,Headers,Here
"История",100,"Вопрос","Ответ"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.message.includes('ожидается "Category"'))).toBe(true)
    })

    it('should validate question values', () => {
      const csvContent = `Category,Value,Question,Answer
"История",50,"Вопрос с неправильной стоимостью","Ответ"
"Наука",abc,"Вопрос с нечисловой стоимостью","Ответ"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть меньше 100'))).toBe(true)
      expect(result.errors.some(e => e.message.includes('должна быть числом'))).toBe(true)
    })

    it('should validate question text length', () => {
      const longText = 'a'.repeat(501)
      const csvContent = `Category,Value,Question,Answer
"История",100,"${longText}","Ответ"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 500 символов'))).toBe(true)
    })

    it('should validate answer text length', () => {
      const longAnswer = 'a'.repeat(201)
      const csvContent = `Category,Value,Question,Answer
"История",100,"Вопрос","${longAnswer}"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('не может быть длиннее 200 символов'))).toBe(true)
    })

    it('should detect duplicate category-value pairs', () => {
      const csvContent = `Category,Value,Question,Answer
"История",100,"Первый вопрос","Ответ 1"
"История",100,"Дублирующий вопрос","Ответ 2"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Дублирование'))).toBe(true)
    })

    it('should handle empty CSV', () => {
      const result = parseCSVPack('', 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('CSV файл пуст'))).toBe(true)
    })

    it('should handle CSV with only headers', () => {
      const csvContent = `Category,Value,Question,Answer`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Нет валидных строк данных'))).toBe(true)
    })

    it('should sort categories alphabetically', () => {
      const csvContent = `Category,Value,Question,Answer
"Зоология",100,"Вопрос о животных","Ответ"
"Астрономия",100,"Вопрос о звездах","Ответ"
"Биология",100,"Вопрос о жизни","Ответ"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(true)
      expect(result.pack?.categories[0].name).toBe('Астрономия')
      expect(result.pack?.categories[1].name).toBe('Биология')
      expect(result.pack?.categories[2].name).toBe('Зоология')
    })

    it('should sort questions by value within categories', () => {
      const csvContent = `Category,Value,Question,Answer
"История",300,"Третий вопрос","Ответ"
"История",100,"Первый вопрос","Ответ"
"История",200,"Второй вопрос","Ответ"`

      const result = parseCSVPack(csvContent, 'Тестовый пакет')

      expect(result.isValid).toBe(true)
      expect(result.pack?.categories[0].questions[0].value).toBe(100)
      expect(result.pack?.categories[0].questions[1].value).toBe(200)
      expect(result.pack?.categories[0].questions[2].value).toBe(300)
    })
  })

  describe('createCSVTemplate', () => {
    it('should create valid CSV template', () => {
      const template = createCSVTemplate()
      const lines = template.split('\n')

      expect(lines[0]).toBe('Category,Value,Question,Answer')
      expect(lines.length).toBeGreaterThan(1)
      
      // Проверяем, что можно распарсить шаблон
      const result = parseCSVPack(template, 'Шаблон')
      expect(result.isValid).toBe(true)
    })

    it('should include example data', () => {
      const template = createCSVTemplate()
      
      expect(template).toContain('История')
      expect(template).toContain('Наука')
      expect(template).toContain('100')
      expect(template).toContain('200')
    })
  })
})
