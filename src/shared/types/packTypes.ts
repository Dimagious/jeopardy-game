// Типы для пакетов вопросов

export interface PackQuestion {
  value: number
  text: string
  answer: string
}

export interface PackCategory {
  name: string
  questions: PackQuestion[]
}

export interface QuestionPack {
  title: string
  categories: PackCategory[]
  description?: string
  author?: string
  version?: string
  createdAt?: string
}

// Типы для CSV импорта
export interface CSVRow {
  category: string
  value: number
  question: string
  answer: string
}

// Типы для валидации
export interface ValidationError {
  row?: number
  field?: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Типы для предпросмотра
export interface PackPreview {
  title: string
  categoryCount: number
  questionCount: number
  totalValue: number
  categories: Array<{
    name: string
    questionCount: number
    values: number[]
  }>
}

// Типы для библиотеки пакетов
export interface PackLibrary {
  packs: QuestionPack[]
  lastUpdated: string
}

// Константы для валидации
export const PACK_VALIDATION_RULES = {
  MIN_QUESTIONS_PER_CATEGORY: 1,
  MAX_QUESTIONS_PER_CATEGORY: 10,
  MIN_CATEGORIES: 1,
  MAX_CATEGORIES: 10,
  MIN_QUESTION_VALUE: 100,
  MAX_QUESTION_VALUE: 5000,
  VALUE_STEP: 100,
  MAX_QUESTION_TEXT_LENGTH: 500,
  MAX_ANSWER_TEXT_LENGTH: 200,
  MAX_TITLE_LENGTH: 100,
  MAX_CATEGORY_NAME_LENGTH: 50,
} as const

// Стандартные значения для вопросов
export const STANDARD_QUESTION_VALUES = [100, 200, 300, 400, 500] as const
