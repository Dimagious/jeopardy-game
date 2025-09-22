import { CSVRow, QuestionPack, PackCategory, ValidationResult, ValidationError, PACK_VALIDATION_RULES } from '../types/packTypes'

/**
 * Парсит CSV строку в массив строк
 */
function parseCSVLines(csvContent: string): string[] {
  const lines = csvContent.split('\n')
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * Парсит CSV строку с учетом кавычек и запятых
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Экранированная кавычка
        current += '"'
        i++ // Пропускаем следующую кавычку
      } else {
        // Начало или конец кавычек
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Разделитель полей
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Добавляем последнее поле
  result.push(current.trim())
  
  return result
}

/**
 * Валидирует заголовки CSV
 */
function validateHeaders(headers: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  const expectedHeaders = ['Category', 'Value', 'Question', 'Answer']
  
  if (headers.length !== expectedHeaders.length) {
    errors.push({
      message: `Ожидается ${expectedHeaders.length} колонок, получено ${headers.length}`,
    })
  }
  
  expectedHeaders.forEach((expected, index) => {
    if (headers[index] !== expected) {
      errors.push({
        message: `Колонка ${index + 1}: ожидается "${expected}", получено "${headers[index] || ''}"`,
      })
    }
  })
  
  return errors
}

/**
 * Валидирует строку данных CSV
 */
function validateCSVRow(row: string[], rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (row.length !== 4) {
    errors.push({
      row: rowIndex,
      message: `Строка ${rowIndex}: ожидается 4 поля, получено ${row.length}`,
    })
    return errors
  }
  
  const [category, valueStr, question, answer] = row
  
  // Валидация категории
  if (!category || category.length === 0) {
    errors.push({
      row: rowIndex,
      field: 'Category',
      message: 'Название категории не может быть пустым',
    })
  } else if (category.length > PACK_VALIDATION_RULES.MAX_CATEGORY_NAME_LENGTH) {
    errors.push({
      row: rowIndex,
      field: 'Category',
      message: `Название категории не может быть длиннее ${PACK_VALIDATION_RULES.MAX_CATEGORY_NAME_LENGTH} символов`,
    })
  }
  
  // Валидация стоимости
  const value = parseInt(valueStr || '', 10)
  if (isNaN(value)) {
    errors.push({
      row: rowIndex,
      field: 'Value',
      message: 'Стоимость должна быть числом',
    })
  } else if (value < PACK_VALIDATION_RULES.MIN_QUESTION_VALUE) {
    errors.push({
      row: rowIndex,
      field: 'Value',
      message: `Стоимость не может быть меньше ${PACK_VALIDATION_RULES.MIN_QUESTION_VALUE}`,
    })
  } else if (value > PACK_VALIDATION_RULES.MAX_QUESTION_VALUE) {
    errors.push({
      row: rowIndex,
      field: 'Value',
      message: `Стоимость не может быть больше ${PACK_VALIDATION_RULES.MAX_QUESTION_VALUE}`,
    })
  } else if (value % PACK_VALIDATION_RULES.VALUE_STEP !== 0) {
    errors.push({
      row: rowIndex,
      field: 'Value',
      message: `Стоимость должна быть кратна ${PACK_VALIDATION_RULES.VALUE_STEP}`,
    })
  }
  
  // Валидация вопроса
  if (!question || question.length === 0) {
    errors.push({
      row: rowIndex,
      field: 'Question',
      message: 'Текст вопроса не может быть пустым',
    })
  } else if (question.length > PACK_VALIDATION_RULES.MAX_QUESTION_TEXT_LENGTH) {
    errors.push({
      row: rowIndex,
      field: 'Question',
      message: `Текст вопроса не может быть длиннее ${PACK_VALIDATION_RULES.MAX_QUESTION_TEXT_LENGTH} символов`,
    })
  }
  
  // Валидация ответа
  if (!answer || answer.length === 0) {
    errors.push({
      row: rowIndex,
      field: 'Answer',
      message: 'Текст ответа не может быть пустым',
    })
  } else if (answer.length > PACK_VALIDATION_RULES.MAX_ANSWER_TEXT_LENGTH) {
    errors.push({
      row: rowIndex,
      field: 'Answer',
      message: `Текст ответа не может быть длиннее ${PACK_VALIDATION_RULES.MAX_ANSWER_TEXT_LENGTH} символов`,
    })
  }
  
  return errors
}

/**
 * Парсит CSV строку в массив строк данных
 */
function parseCSVData(csvContent: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  
  const lines = parseCSVLines(csvContent)
  
  if (lines.length === 0) {
    errors.push({
      message: 'CSV файл пуст',
    })
    return { isValid: false, errors, warnings }
  }
  
  // Парсим заголовки
  const headerLine = parseCSVLine(lines[0] || '')
  const headerErrors = validateHeaders(headerLine)
  errors.push(...headerErrors)
  
  if (headerErrors.length > 0) {
    return { isValid: false, errors, warnings }
  }
  
  // Парсим данные
  const dataRows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i] || '')
    const rowErrors = validateCSVRow(row, i)
    
    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
    } else {
      const [category, valueStr, question, answer] = row
      dataRows.push({
        category: (category || '').trim(),
        value: parseInt(valueStr || '0', 10),
        question: (question || '').trim(),
        answer: (answer || '').trim(),
      })
    }
  }
  
  // Дополнительные проверки
  if (dataRows.length === 0) {
    errors.push({
      message: 'Нет валидных строк данных',
    })
  }
  
  // Проверяем уникальность категорий и значений
  const categoryValuePairs = new Set<string>()
  dataRows.forEach((row, index) => {
    const key = `${row.category}:${row.value}`
    if (categoryValuePairs.has(key)) {
      errors.push({
        row: index + 2, // +2 потому что начинаем с 1 и пропускаем заголовок
        message: `Дублирование: категория "${row.category}" со стоимостью ${row.value}`,
      })
    }
    categoryValuePairs.add(key)
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Конвертирует CSV данные в QuestionPack
 */
function csvDataToPack(csvData: CSVRow[], title: string): QuestionPack {
  // Группируем по категориям
  const categoryMap = new Map<string, CSVRow[]>()
  
  csvData.forEach(row => {
    if (!categoryMap.has(row.category)) {
      categoryMap.set(row.category, [])
    }
    categoryMap.get(row.category)!.push(row)
  })
  
  // Создаем категории
  const categories: PackCategory[] = []
  
  categoryMap.forEach((rows, categoryName) => {
    // Сортируем по стоимости
    rows.sort((a, b) => a.value - b.value)
    
    categories.push({
      name: categoryName,
      questions: rows.map(row => ({
        value: row.value,
        text: row.question,
        answer: row.answer,
      })),
    })
  })
  
  // Сортируем категории по алфавиту
  categories.sort((a, b) => a.name.localeCompare(b.name))
  
  return {
    title,
    categories,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Основная функция парсинга CSV
 */
export function parseCSVPack(csvContent: string, title: string): ValidationResult & { pack?: QuestionPack } {
  const parseResult = parseCSVData(csvContent)
  
  if (!parseResult.isValid) {
    return parseResult
  }
  
  // Если парсинг успешен, создаем пакет
  const lines = parseCSVLines(csvContent)
  const dataRows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i] || '')
    const [category, valueStr, question, answer] = row
    dataRows.push({
      category: (category || '').trim(),
      value: parseInt(valueStr || '0', 10),
      question: (question || '').trim(),
      answer: (answer || '').trim(),
    })
  }
  
  const pack = csvDataToPack(dataRows, title)
  
  return {
    ...parseResult,
    pack,
  }
}

/**
 * Создает CSV шаблон
 */
export function createCSVTemplate(): string {
  const headers = ['Category', 'Value', 'Question', 'Answer']
  const examples = [
    ['История', '100', 'В каком году началась Вторая мировая война?', '1939'],
    ['История', '200', 'Кто был первым президентом США?', 'Джордж Вашингтон'],
    ['Наука', '100', 'Какая планета ближайшая к Солнцу?', 'Меркурий'],
    ['Наука', '200', 'Сколько костей в теле взрослого человека?', '206'],
  ]
  
  const csvLines = [
    headers.join(','),
    ...examples.map(row => row.map(field => `"${field}"`).join(',')),
  ]
  
  return csvLines.join('\n')
}
