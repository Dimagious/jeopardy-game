import { ScoreEvent, Team, Question } from './types'

export interface ExportData {
  scoreEvents: ScoreEvent[]
  teams: Team[]
  questions: Question[]
  gameTitle: string
  exportDate: string
}

/**
 * Экспортирует результаты игры в CSV формат
 * @param data - данные для экспорта
 * @returns CSV строка
 */
export function exportToCSV(data: ExportData): string {
  const { scoreEvents, teams, questions, gameTitle, exportDate } = data
  
  // Заголовок CSV
  const headers = [
    'Время',
    'ID Вопроса',
    'Текст Вопроса',
    'Стоимость',
    'ID Команды',
    'Название Команды',
    'Дельта',
    'Правильный Ответ'
  ]
  
  // Создаем мапу для быстрого поиска команд и вопросов
  const teamMap = new Map(teams.map(team => [team.id, team]))
  const questionMap = new Map(questions.map(q => [q.id, q]))
  
  // Сортируем события по времени
  const sortedEvents = [...scoreEvents].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  
  // Создаем строки данных
  const rows = sortedEvents.map(event => {
    const team = teamMap.get(event.teamId)
    const question = questionMap.get(event.questionId)
    
    return [
      event.createdAt,
      event.questionId,
      question?.text || 'Неизвестный вопрос',
      question?.value || 0,
      event.teamId,
      team?.name || 'Неизвестная команда',
      event.delta,
      question?.answer || 'Неизвестный ответ'
    ]
  })
  
  // Объединяем заголовки и данные
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  // Добавляем метаданные в начало файла
  const metadata = [
    `# Экспорт результатов игры: ${gameTitle}`,
    `# Дата экспорта: ${exportDate}`,
    `# Всего событий: ${scoreEvents.length}`,
    `# Всего команд: ${teams.length}`,
    '',
    csvContent
  ].join('\n')
  
  return metadata
}

/**
 * Скачивает CSV файл
 * @param csvContent - содержимое CSV
 * @param filename - имя файла
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Генерирует имя файла для экспорта
 * @param gameTitle - название игры
 * @param exportDate - дата экспорта
 * @returns имя файла
 */
export function generateExportFilename(gameTitle: string, exportDate: string): string {
  const date = new Date(exportDate)
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0]?.replace(/:/g, '-') || '00-00-00' // HH-MM-SS
  
  // Очищаем название игры от недопустимых символов
  const cleanTitle = gameTitle.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '').replace(/\s+/g, '_')
  
  return `jeopardy_${cleanTitle}_${dateStr}_${timeStr}.csv`
}
