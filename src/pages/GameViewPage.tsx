import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuthSimple'
import { useGame } from '../shared/useGames'
import { useCategories } from '../shared/useCategories'
import { useQuestionsByGame } from '../shared/useQuestions'
import { Card } from '../ui/Card'
import Button from '../ui/Button'
// import { CategoryCard, QuestionCard } from '../components' // Не используются в этой версии

function GameViewPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { hasPermission, isLoading: authLoading, currentRole } = useAuth()
  
  const { game, isLoading: gameLoading, error: gameError } = useGame(gameId || null)
  const { categories, isLoading: categoriesLoading } = useCategories(gameId || null)
  const { questions: allQuestions, isLoading: questionsLoading } = useQuestionsByGame(gameId || null)
  
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Проверяем права доступа (только после загрузки аутентификации)
  useEffect(() => {
    if (authLoading) return // Ждем загрузки аутентификации
    
    if (!hasPermission('canViewGames')) {
      navigate('/admin')
    }
  }, [hasPermission, navigate, authLoading, currentRole])

  // Получаем вопросы для выбранной категории
  const getQuestionsForCategory = (categoryId: string) => {
    // Используем правильное поле category_id из базы данных
    return allQuestions.filter(q => (q as unknown as Record<string, unknown>).category_id === categoryId)
  }

  if (authLoading || gameLoading || categoriesLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (gameError || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-4">The game you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Admin
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{game.description}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.status === 'active' ? 'bg-green-100 text-green-800' :
                      game.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      game.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {game.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Categories:</span>
                    <span className="font-semibold text-blue-600">{categories.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Questions:</span>
                    <span className="font-semibold text-green-600">{allQuestions.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate(`/org/${game.orgId}/admin/games/${game.id}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
                >
                  Edit Game
                </Button>
                <Button
                  onClick={() => navigate('/admin')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
                >
                  Back to Games
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories and Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories List */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Categories
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-5 h-5 rounded-md shadow-sm border border-gray-200"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-semibold text-gray-800">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {getQuestionsForCategory(category.id).length} questions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                {selectedCategory 
                  ? `Questions in "${categories.find(c => c.id === selectedCategory)?.name}"`
                  : 'Select a category to view questions'
                }
              </h2>
              
              {selectedCategory ? (
                <div className="space-y-4">
                  {getQuestionsForCategory(selectedCategory).map((question) => (
                    <div
                      key={question.id}
                      className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">${question.value}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                              {question.text}
                            </h3>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-400">
                            <div className="text-sm font-medium text-gray-700 mb-1">Answer:</div>
                            <div className="text-gray-900 font-medium">{question.answer}</div>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            {question.isLocked && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
                                🔒 Locked
                              </span>
                            )}
                            {question.isDone && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                                ✅ Done
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Click on a category to view its questions</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameViewPage
