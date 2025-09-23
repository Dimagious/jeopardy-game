import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Button from '../ui/Button'
import { parseCSVPack, createCSVTemplate } from '../shared/parsers/csvParser'
import { parseJSONPack, createJSONTemplate } from '../shared/parsers/jsonParser'
import { addPackToLibrary, createPackPreview } from '../shared/packLibrary'
import { QuestionPack, ValidationError } from '../shared/types/packTypes'

interface PackImporterProps {
  onPackImported?: (pack: QuestionPack) => void
  className?: string
}

export default function PackImporter({ onPackImported, className }: PackImporterProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importType, setImportType] = useState<'csv' | 'json'>('csv')
  const [packTitle, setPackTitle] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([])
  const [importedPack, setImportedPack] = useState<QuestionPack | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        handleImport(content)
      }
    }
    reader.readAsText(file)
  }

  const handleTextImport = () => {
    const content = textAreaRef.current?.value
    if (content) {
      handleImport(content)
    }
  }

  const handleImport = (content: string) => {
    setIsImporting(true)
    setValidationErrors([])
    setValidationWarnings([])
    setImportedPack(null)

    try {
      let result
      
      if (importType === 'csv') {
        result = parseCSVPack(content, packTitle || 'Импортированный пакет')
      } else {
        result = parseJSONPack(content)
      }

      if (result.isValid && result.pack) {
        setValidationWarnings(result.warnings)
        setImportedPack(result.pack)
        setShowPreview(true)
      } else {
        setValidationErrors(result.errors)
        setValidationWarnings(result.warnings)
      }
    } catch (error) {
      setValidationErrors([{
        message: `Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      }])
    } finally {
      setIsImporting(false)
    }
  }

  const handleSavePack = () => {
    if (importedPack) {
      addPackToLibrary(importedPack)
      onPackImported?.(importedPack)
      setImportedPack(null)
      setShowPreview(false)
      setPackTitle('')
      if (textAreaRef.current) {
        textAreaRef.current.value = ''
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadTemplate = () => {
    const template = importType === 'csv' ? createCSVTemplate() : createJSONTemplate()
    const filename = `template.${importType}`
    const blob = new Blob([template], { type: importType === 'csv' ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const preview = importedPack ? createPackPreview(importedPack) : null

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Импорт пакета вопросов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Выбор типа импорта */}
          <div className="flex space-x-4">
            <Button
              variant={importType === 'csv' ? 'primary' : 'secondary'}
              onClick={() => setImportType('csv')}
            >
              CSV
            </Button>
            <Button
              variant={importType === 'json' ? 'primary' : 'secondary'}
              onClick={() => setImportType('json')}
            >
              JSON
            </Button>
          </div>

          {/* Название пакета (только для CSV) */}
          {importType === 'csv' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Название пакета
              </label>
              <input
                type="text"
                value={packTitle}
                onChange={(e) => setPackTitle(e.target.value)}
                placeholder="Введите название пакета"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Импорт из файла */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Импорт из файла
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={importType === 'csv' ? '.csv' : '.json'}
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Импорт из текста */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Или вставьте содержимое файла
            </label>
            <textarea
              ref={textAreaRef}
              rows={10}
              placeholder={`Вставьте содержимое ${importType.toUpperCase()} файла...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="flex space-x-2 mt-2">
              <Button
                onClick={handleTextImport}
                disabled={isImporting}
                className="flex-1"
              >
                {isImporting ? 'Импорт...' : 'Импортировать'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownloadTemplate}
              >
                📄 Шаблон
              </Button>
            </div>
          </div>

          {/* Ошибки валидации */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">Ошибки валидации:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    {error.row && `Строка ${error.row}: `}
                    {error.field && `Поле "${error.field}": `}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Предупреждения */}
          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-yellow-800 font-medium mb-2">Предупреждения:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Предпросмотр */}
          {showPreview && preview && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-green-800 font-medium mb-2">Предпросмотр пакета:</h4>
              <div className="text-green-700 text-sm space-y-1">
                <p><strong>Название:</strong> {preview.title}</p>
                <p><strong>Категорий:</strong> {preview.categoryCount}</p>
                <p><strong>Вопросов:</strong> {preview.questionCount}</p>
                <p><strong>Общая стоимость:</strong> ${preview.totalValue}</p>
              </div>
              
              <div className="mt-3">
                <h5 className="font-medium mb-2">Категории:</h5>
                <div className="space-y-1">
                  {preview.categories.map((category, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{category.name}</span>
                      {' '}({category.questionCount} вопросов: {category.values.join(', ')})
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button onClick={handleSavePack} className="flex-1">
                  💾 Сохранить в библиотеку
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
