import { QuestionPack, PackLibrary, PackPreview } from './types/packTypes'

const LIBRARY_STORAGE_KEY = 'jeopardy-pack-library'

/**
 * Загружает библиотеку пакетов из localStorage
 */
export function loadPackLibrary(): PackLibrary {
  try {
    const stored = localStorage.getItem(LIBRARY_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        packs: parsed.packs || [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      }
    }
  } catch (error) {
    console.warn('Ошибка загрузки библиотеки пакетов:', error)
  }
  
  return {
    packs: [],
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Сохраняет библиотеку пакетов в localStorage
 */
export function savePackLibrary(library: PackLibrary): void {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library))
  } catch (error) {
    console.error('Ошибка сохранения библиотеки пакетов:', error)
    throw new Error('Не удалось сохранить библиотеку пакетов')
  }
}

/**
 * Добавляет пакет в библиотеку
 */
export function addPackToLibrary(pack: QuestionPack): void {
  const library = loadPackLibrary()
  
  // Проверяем, нет ли уже пакета с таким названием
  const existingIndex = library.packs.findIndex(p => p.title === pack.title)
  
  if (existingIndex >= 0) {
    // Обновляем существующий пакет
    library.packs[existingIndex] = {
      ...pack,
      createdAt: library.packs[existingIndex]?.createdAt || new Date().toISOString(), // Сохраняем оригинальную дату создания
    }
  } else {
    // Добавляем новый пакет
    library.packs.push(pack)
  }
  
  library.lastUpdated = new Date().toISOString()
  savePackLibrary(library)
}

/**
 * Удаляет пакет из библиотеки
 */
export function removePackFromLibrary(packTitle: string): void {
  const library = loadPackLibrary()
  library.packs = library.packs.filter(p => p.title !== packTitle)
  library.lastUpdated = new Date().toISOString()
  savePackLibrary(library)
}

/**
 * Получает пакет по названию
 */
export function getPackFromLibrary(packTitle: string): QuestionPack | undefined {
  const library = loadPackLibrary()
  return library.packs.find(p => p.title === packTitle)
}

/**
 * Получает все пакеты из библиотеки
 */
export function getAllPacksFromLibrary(): QuestionPack[] {
  const library = loadPackLibrary()
  return [...library.packs] // Возвращаем копию
}

/**
 * Создает предпросмотр пакета
 */
export function createPackPreview(pack: QuestionPack): PackPreview {
  const totalValue = pack.categories.reduce((sum, category) => {
    return sum + category.questions.reduce((catSum, question) => catSum + question.value, 0)
  }, 0)
  
  const questionCount = pack.categories.reduce((sum, category) => sum + category.questions.length, 0)
  
  const categories = pack.categories.map(category => ({
    name: category.name,
    questionCount: category.questions.length,
    values: category.questions.map(q => q.value).sort((a, b) => a - b),
  }))
  
  return {
    title: pack.title,
    categoryCount: pack.categories.length,
    questionCount,
    totalValue,
    categories,
  }
}

/**
 * Экспортирует пакет в JSON
 */
export function exportPackToJSON(pack: QuestionPack): string {
  return JSON.stringify(pack, null, 2)
}

/**
 * Экспортирует пакет в CSV
 */
export function exportPackToCSV(pack: QuestionPack): string {
  const headers = ['Category', 'Value', 'Question', 'Answer']
  const rows: string[] = [headers.join(',')]
  
  pack.categories.forEach(category => {
    category.questions.forEach(question => {
      const row = [
        `"${category.name}"`,
        question.value.toString(),
        `"${question.text}"`,
        `"${question.answer}"`,
      ]
      rows.push(row.join(','))
    })
  })
  
  return rows.join('\n')
}

/**
 * Скачивает файл
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Скачивает пакет как JSON файл
 */
export function downloadPackAsJSON(pack: QuestionPack): void {
  const content = exportPackToJSON(pack)
  const filename = `${pack.title.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '').replace(/\s+/g, '_')}.json`
  downloadFile(content, filename, 'application/json')
}

/**
 * Скачивает пакет как CSV файл
 */
export function downloadPackAsCSV(pack: QuestionPack): void {
  const content = exportPackToCSV(pack)
  const filename = `${pack.title.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '').replace(/\s+/g, '_')}.csv`
  downloadFile(content, filename, 'text/csv')
}

/**
 * Очищает библиотеку пакетов
 */
export function clearPackLibrary(): void {
  try {
    localStorage.removeItem(LIBRARY_STORAGE_KEY)
  } catch (error) {
    console.error('Ошибка очистки библиотеки пакетов:', error)
    throw error
  }
}

/**
 * Получает статистику библиотеки
 */
export function getLibraryStats(): {
  totalPacks: number
  totalQuestions: number
  totalCategories: number
  lastUpdated: string
} {
  const library = loadPackLibrary()
  
  const totalQuestions = library.packs.reduce((sum, pack) => {
    return sum + pack.categories.reduce((catSum, category) => catSum + category.questions.length, 0)
  }, 0)
  
  const totalCategories = library.packs.reduce((sum, pack) => sum + pack.categories.length, 0)
  
  return {
    totalPacks: library.packs.length,
    totalQuestions,
    totalCategories,
    lastUpdated: library.lastUpdated,
  }
}
