import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Button from '../ui/Button'
import { 
  getAllPacksFromLibrary, 
  removePackFromLibrary, 
  downloadPackAsJSON, 
  downloadPackAsCSV,
  getLibraryStats,
  clearPackLibrary
} from '../shared/packLibrary'
import { QuestionPack, PackPreview } from '../shared/types/packTypes'

interface PackLibraryProps {
  onPackSelected?: (pack: QuestionPack) => void
  className?: string
}

export default function PackLibrary({ onPackSelected, className }: PackLibraryProps) {
  const [packs, setPacks] = useState<QuestionPack[]>([])
  const [selectedPack, setSelectedPack] = useState<QuestionPack | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalPacks: 0,
    totalQuestions: 0,
    totalCategories: 0,
    lastUpdated: '',
  })

  const loadPacks = () => {
    const allPacks = getAllPacksFromLibrary()
    setPacks(allPacks)
    setStats(getLibraryStats())
  }

  useEffect(() => {
    loadPacks()
  }, [])

  const handlePackSelect = (pack: QuestionPack) => {
    setSelectedPack(pack)
    onPackSelected?.(pack)
  }

  const handleDeletePack = (packTitle: string) => {
    removePackFromLibrary(packTitle)
    loadPacks()
    if (selectedPack?.title === packTitle) {
      setSelectedPack(null)
    }
    setShowConfirmDelete(null)
  }

  const handleClearLibrary = () => {
    if (confirm('Вы уверены, что хотите очистить всю библиотеку? Это действие нельзя отменить.')) {
      clearPackLibrary()
      loadPacks()
      setSelectedPack(null)
    }
  }

  const createPreview = (pack: QuestionPack): PackPreview => {
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

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Библиотека пакетов</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPacks}</div>
              <div className="text-sm text-gray-600">Пакетов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Вопросов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalCategories}</div>
              <div className="text-sm text-gray-600">Категорий</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">
                Обновлено:<br />
                {new Date(stats.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant="secondary"
              onClick={loadPacks}
              className="flex-1"
            >
              🔄 Обновить
            </Button>
            {packs.length > 0 && (
              <Button
                variant="danger"
                onClick={handleClearLibrary}
              >
                🗑️ Очистить
              </Button>
            )}
          </div>

          {/* Список пакетов */}
          {packs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Библиотека пуста</p>
              <p className="text-sm">Импортируйте пакет вопросов, чтобы начать</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => {
                const preview = createPreview(pack)
                const isSelected = selectedPack?.title === pack.title
                
                return (
                  <div
                    key={pack.title}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePackSelect(pack)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{pack.title}</h3>
                        {pack.description && (
                          <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                        )}
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                          <span>{preview.categoryCount} категорий</span>
                          <span>{preview.questionCount} вопросов</span>
                          <span>${preview.totalValue} общая стоимость</span>
                        </div>
                        {pack.author && (
                          <p className="text-xs text-gray-400 mt-1">Автор: {pack.author}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-1 ml-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadPackAsJSON(pack)
                          }}
                          title="Скачать как JSON"
                        >
                          📄
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadPackAsCSV(pack)
                          }}
                          title="Скачать как CSV"
                        >
                          📊
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowConfirmDelete(pack.title)
                          }}
                          title="Удалить пакет"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Подтверждение удаления */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium mb-4">Подтверждение удаления</h3>
                <p className="text-gray-600 mb-6">
                  Вы уверены, что хотите удалить пакет "{showConfirmDelete}"? 
                  Это действие нельзя отменить.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePack(showConfirmDelete)}
                    className="flex-1"
                  >
                    Удалить
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowConfirmDelete(null)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
