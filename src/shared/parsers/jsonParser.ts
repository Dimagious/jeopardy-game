import { QuestionPack, PackCategory, PackQuestion, ValidationResult, ValidationError, PACK_VALIDATION_RULES } from '../types/packTypes'

/**
 * Валидирует вопрос
 */
function validateQuestion(question: unknown, categoryIndex: number, questionIndex: number): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!question || typeof question !== 'object') {
    errors.push({
      message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: должен быть объектом`,
    })
    return errors
  }
  
  // Валидация стоимости
  const questionObj = question as Record<string, unknown>
  if (typeof questionObj.value !== 'number') {
    errors.push({
      message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: поле "value" должно быть числом`,
    })
  } else {
    if (questionObj.value < PACK_VALIDATION_RULES.MIN_QUESTION_VALUE) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: стоимость не может быть меньше ${PACK_VALIDATION_RULES.MIN_QUESTION_VALUE}`,
      })
    }
    if (questionObj.value > PACK_VALIDATION_RULES.MAX_QUESTION_VALUE) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: стоимость не может быть больше ${PACK_VALIDATION_RULES.MAX_QUESTION_VALUE}`,
      })
    }
    if (questionObj.value % PACK_VALIDATION_RULES.VALUE_STEP !== 0) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: стоимость должна быть кратна ${PACK_VALIDATION_RULES.VALUE_STEP}`,
      })
    }
  }
  
  // Валидация текста вопроса
  if (typeof questionObj.text !== 'string') {
    errors.push({
      message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: поле "text" должно быть строкой`,
    })
  } else {
    if (questionObj.text.trim().length === 0) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: текст вопроса не может быть пустым`,
      })
    }
    if (questionObj.text.length > PACK_VALIDATION_RULES.MAX_QUESTION_TEXT_LENGTH) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: текст вопроса не может быть длиннее ${PACK_VALIDATION_RULES.MAX_QUESTION_TEXT_LENGTH} символов`,
      })
    }
  }
  
  // Валидация ответа
  if (typeof questionObj.answer !== 'string') {
    errors.push({
      message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: поле "answer" должно быть строкой`,
    })
  } else {
    if (questionObj.answer.trim().length === 0) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: текст ответа не может быть пустым`,
      })
    }
    if (questionObj.answer.length > PACK_VALIDATION_RULES.MAX_ANSWER_TEXT_LENGTH) {
      errors.push({
        message: `Категория ${categoryIndex + 1}, вопрос ${questionIndex + 1}: текст ответа не может быть длиннее ${PACK_VALIDATION_RULES.MAX_ANSWER_TEXT_LENGTH} символов`,
      })
    }
  }
  
  return errors
}

/**
 * Валидирует категорию
 */
function validateCategory(category: unknown, categoryIndex: number): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!category || typeof category !== 'object') {
    errors.push({
      message: `Категория ${categoryIndex + 1}: должна быть объектом`,
    })
    return errors
  }
  
  const categoryObj = category as Record<string, unknown>
  
  // Валидация названия категории
  if (typeof categoryObj.name !== 'string') {
    errors.push({
      message: `Категория ${categoryIndex + 1}: поле "name" должно быть строкой`,
    })
  } else {
    if (categoryObj.name.trim().length === 0) {
      errors.push({
        message: `Категория ${categoryIndex + 1}: название категории не может быть пустым`,
      })
    }
    if (categoryObj.name.length > PACK_VALIDATION_RULES.MAX_CATEGORY_NAME_LENGTH) {
      errors.push({
        message: `Категория ${categoryIndex + 1}: название категории не может быть длиннее ${PACK_VALIDATION_RULES.MAX_CATEGORY_NAME_LENGTH} символов`,
      })
    }
  }
  
  // Валидация вопросов
  if (!Array.isArray(categoryObj.questions)) {
    errors.push({
      message: `Категория ${categoryIndex + 1}: поле "questions" должно быть массивом`,
    })
  } else {
    if (categoryObj.questions.length < PACK_VALIDATION_RULES.MIN_QUESTIONS_PER_CATEGORY) {
      errors.push({
        message: `Категория ${categoryIndex + 1}: должно быть минимум ${PACK_VALIDATION_RULES.MIN_QUESTIONS_PER_CATEGORY} вопросов`,
      })
    }
    if (categoryObj.questions.length > PACK_VALIDATION_RULES.MAX_QUESTIONS_PER_CATEGORY) {
      errors.push({
        message: `Категория ${categoryIndex + 1}: не может быть больше ${PACK_VALIDATION_RULES.MAX_QUESTIONS_PER_CATEGORY} вопросов`,
      })
    }
    
    // Валидируем каждый вопрос
    categoryObj.questions.forEach((question: unknown, questionIndex: number) => {
      errors.push(...validateQuestion(question, categoryIndex, questionIndex))
    })
    
    // Проверяем уникальность стоимостей в категории
    const values = categoryObj.questions.map((q: unknown) => (q as { value?: number }).value).filter((v: unknown) => typeof v === 'number')
    const uniqueValues = new Set(values)
    if (values.length !== uniqueValues.size) {
      errors.push({
        message: `Категория ${categoryIndex + 1}: есть дублирующиеся стоимости вопросов`,
      })
    }
  }
  
  return errors
}

/**
 * Валидирует пакет вопросов
 */
function validatePack(pack: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  
  if (!pack || typeof pack !== 'object') {
    errors.push({
      message: 'Пакет должен быть объектом',
    })
    return { isValid: false, errors, warnings }
  }
  
  const packObj = pack as Record<string, unknown>
  
  // Валидация заголовка
  if (typeof packObj.title !== 'string') {
    errors.push({
      message: 'Поле "title" должно быть строкой',
    })
  } else {
    if (packObj.title.trim().length === 0) {
      errors.push({
        message: 'Название пакета не может быть пустым',
      })
    }
    if (packObj.title.length > PACK_VALIDATION_RULES.MAX_TITLE_LENGTH) {
      errors.push({
        message: `Название пакета не может быть длиннее ${PACK_VALIDATION_RULES.MAX_TITLE_LENGTH} символов`,
      })
    }
  }
  
  // Валидация категорий
  if (!Array.isArray(packObj.categories)) {
    errors.push({
      message: 'Поле "categories" должно быть массивом',
    })
  } else {
    if (packObj.categories.length < PACK_VALIDATION_RULES.MIN_CATEGORIES) {
      errors.push({
        message: `Должно быть минимум ${PACK_VALIDATION_RULES.MIN_CATEGORIES} категорий`,
      })
    }
    if (packObj.categories.length > PACK_VALIDATION_RULES.MAX_CATEGORIES) {
      errors.push({
        message: `Не может быть больше ${PACK_VALIDATION_RULES.MAX_CATEGORIES} категорий`,
      })
    }
    
    // Валидируем каждую категорию
    packObj.categories.forEach((category: unknown, index: number) => {
      errors.push(...validateCategory(category, index))
    })
    
    // Проверяем уникальность названий категорий
    const categoryNames = packObj.categories.map((c: unknown) => (c as { name?: string }).name).filter((n: unknown) => typeof n === 'string')
    const uniqueNames = new Set(categoryNames)
    if (categoryNames.length !== uniqueNames.size) {
      errors.push({
        message: 'Есть дублирующиеся названия категорий',
      })
    }
  }
  
  // Предупреждения для необязательных полей
  if (!packObj.description) {
    warnings.push({
      message: 'Рекомендуется добавить описание пакета',
    })
  }
  
  if (!packObj.author) {
    warnings.push({
      message: 'Рекомендуется указать автора пакета',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Нормализует пакет (сортирует, очищает данные)
 */
function normalizePack(pack: unknown): QuestionPack {
  const packObj = pack as { 
    title: string; 
    categories: Array<{ 
      name: string; 
      questions: Array<{ value: number; text: string; answer: string }> 
    }>;
    description?: string;
    author?: string;
    version?: string;
    createdAt?: string;
  }
  
  const normalizedCategories: PackCategory[] = packObj.categories.map((category) => {
    // Сортируем вопросы по стоимости
    const sortedQuestions = category.questions
      .filter((q) => q.value && q.text && q.answer)
      .sort((a, b) => a.value - b.value)
      .map((question): PackQuestion => ({
        value: question.value,
        text: question.text.trim(),
        answer: question.answer.trim(),
      }))
    
    return {
      name: category.name.trim(),
      questions: sortedQuestions,
    }
  })
  
  // Сортируем категории по алфавиту
  normalizedCategories.sort((a, b) => a.name.localeCompare(b.name))
  
  const result: QuestionPack = {
    title: packObj.title.trim(),
    categories: normalizedCategories,
    createdAt: packObj.createdAt || new Date().toISOString(),
  }
  
  if (packObj.description) {
    result.description = packObj.description.trim()
  }
  
  if (packObj.author) {
    result.author = packObj.author.trim()
  }
  
  if (packObj.version) {
    result.version = packObj.version.trim()
  }
  
  return result
}

/**
 * Основная функция парсинга JSON
 */
export function parseJSONPack(jsonContent: string): ValidationResult & { pack?: QuestionPack } {
  try {
    const parsed = JSON.parse(jsonContent)
    const validation = validatePack(parsed)
    
    if (!validation.isValid) {
      return validation
    }
    
    const pack = normalizePack(parsed)
    
    return {
      ...validation,
      pack,
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        message: `Ошибка парсинга JSON: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      }],
      warnings: [],
    }
  }
}

/**
 * Создает JSON шаблон
 */
export function createJSONTemplate(): string {
  const template: QuestionPack = {
    title: 'Мой пакет вопросов',
    description: 'Описание пакета',
    author: 'Автор',
    version: '1.0.0',
    categories: [
      {
        name: 'История',
        questions: [
          {
            value: 100,
            text: 'В каком году началась Вторая мировая война?',
            answer: '1939',
          },
          {
            value: 200,
            text: 'Кто был первым президентом США?',
            answer: 'Джордж Вашингтон',
          },
        ],
      },
      {
        name: 'Наука',
        questions: [
          {
            value: 100,
            text: 'Какая планета ближайшая к Солнцу?',
            answer: 'Меркурий',
          },
          {
            value: 200,
            text: 'Сколько костей в теле взрослого человека?',
            answer: '206',
          },
        ],
      },
    ],
  }
  
  return JSON.stringify(template, null, 2)
}
