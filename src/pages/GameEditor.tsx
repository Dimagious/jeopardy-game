import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuthSimple'
import { useCategories } from '../shared/useCategories'
import { useQuestionsByGame } from '../shared/useQuestions'
import { Category, Question, CreateCategoryRequest, UpdateCategoryRequest } from '../shared/types'
import { CategoryCard, CategoryForm, QuestionCard, QuestionForm } from '../components'
import { Card } from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

function GameEditor() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { hasPermission, isLoading: authLoading } = useAuth()
  
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    duplicateCategory,
    limits: categoryLimits,
  } = useCategories(gameId || null)

  const {
    questions: allQuestions,
    isLoading: questionsLoading,
    error: questionsError,
    limits: questionLimits,
  } = useQuestionsByGame(gameId || null)

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Проверяем права доступа (только после загрузки аутентификации)
  useEffect(() => {
    if (authLoading) return // Ждем загрузки аутентификации
    
    if (!hasPermission('canManageGames')) {
      navigate('/admin')
    }
  }, [hasPermission, navigate, authLoading])

  const handleCreateCategory = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      if ('name' in data && data.name) {
        await createCategory(data as CreateCategoryRequest)
        setShowCategoryForm(false)
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleUpdateCategory = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    if (!editingCategory) return
    
    try {
      await updateCategory(editingCategory.id, data)
      setEditingCategory(null)
      setShowCategoryForm(false)
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all questions in this category.`)) {
      try {
        await deleteCategory(category.id)
        if (selectedCategory?.id === category.id) {
          setSelectedCategory(null)
        }
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  const handleDuplicateCategory = async (category: Category) => {
    try {
      await duplicateCategory(category.id)
    } catch (error) {
      console.error('Failed to duplicate category:', error)
    }
  }

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(currentIndex, 1)
    if (movedCategory) {
      newCategories.splice(newIndex, 0, movedCategory)
    }

    const categoryIds = newCategories.map(c => c.id)
    
    try {
      await reorderCategories({ categoryIds })
    } catch (error) {
      console.error('Failed to reorder categories:', error)
    }
  }

  const getQuestionsForCategory = (categoryId: string) => {
    // Используем правильное поле category_id из базы данных
    return allQuestions.filter(q => (q as unknown as Record<string, unknown>).category_id === categoryId)
  }

  const handleCreateQuestion = async () => {
    if (!selectedCategory) return
    
    try {
      // This would need to be implemented in useQuestions hook
      // await createQuestion(selectedCategory.id, data)
      setShowQuestionForm(false)
    } catch (error) {
      console.error('Failed to create question:', error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = async () => {
    if (window.confirm(`Are you sure you want to delete this question?`)) {
      try {
        // This would need to be implemented in useQuestions hook
        // await deleteQuestion(question.id)
      } catch (error) {
        console.error('Failed to delete question:', error)
      }
    }
  }

  const handleDuplicateQuestion = async () => {
    try {
      // This would need to be implemented in useQuestions hook
      // await duplicateQuestion(question.id)
    } catch (error) {
      console.error('Failed to duplicate question:', error)
    }
  }

  if (authLoading || categoriesLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading game editor...</div>
        </div>
      </div>
    )
  }

  if (categoriesError || questionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600">
            Error: {categoriesError || questionsError}
          </div>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Back to Admin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Game Editor</h1>
              <p className="text-gray-600">Create and manage your game content</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/admin')}
              >
                Back to Admin
              </Button>
              <Button
                onClick={() => navigate(`/host/${gameId}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Preview Game
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                <Button
                  onClick={() => {
                    setEditingCategory(null)
                    setShowCategoryForm(true)
                  }}
                  disabled={categoryLimits ? !categoryLimits.canCreate : false}
                  size="sm"
                >
                  Add Category
                </Button>
              </div>

              {categoryLimits && (
                <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
                  Categories: {categoryLimits.current} / {categoryLimits.max}
                </div>
              )}

              <div className="space-y-3">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    questionsCount={getQuestionsForCategory(category.id).length}
                    onEdit={() => handleEditCategory(category)}
                    onDelete={() => handleDeleteCategory(category)}
                    onDuplicate={() => handleDuplicateCategory(category)}
                    onMoveUp={index > 0 ? () => handleMoveCategory(category, 'up') : () => {}}
                    onMoveDown={index < categories.length - 1 ? () => handleMoveCategory(category, 'down') : () => {}}
                    isFirst={index === 0}
                    isLast={index === categories.length - 1}
                    onSelect={() => setSelectedCategory(category)}
                    isSelected={selectedCategory?.id === category.id}
                  />
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No categories yet</p>
                    <p className="text-sm">Create your first category to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCategory ? `${selectedCategory.name} Questions` : 'Select a Category'}
                </h2>
                {selectedCategory && (
                  <Button
                    onClick={() => {
                      setEditingQuestion(null)
                      setShowQuestionForm(true)
                    }}
                    disabled={questionLimits ? !questionLimits.canCreate : false}
                    size="sm"
                  >
                    Add Question
                  </Button>
                )}
              </div>

              {questionLimits && (
                <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
                  Questions: {questionLimits.current} / {questionLimits.max}
                </div>
              )}

              {selectedCategory ? (
                <div className="space-y-3">
                  {getQuestionsForCategory(selectedCategory.id).map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onEdit={() => handleEditQuestion(question)}
                      onDelete={() => handleDeleteQuestion()}
                      onDuplicate={() => handleDuplicateQuestion()}
                      isFirst={index === 0}
                      isLast={index === getQuestionsForCategory(selectedCategory.id).length - 1}
                    />
                  ))}

                  {getQuestionsForCategory(selectedCategory.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No questions in this category</p>
                      <p className="text-sm">Add questions to get started</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a category to view and manage questions</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      <Modal
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false)
          setEditingCategory(null)
        }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setShowCategoryForm(false)
            setEditingCategory(null)
          }}
          initialData={editingCategory}
          isEditing={!!editingCategory}
          limits={categoryLimits}
        />
      </Modal>

      {/* Question Form Modal */}
      <Modal
        isOpen={showQuestionForm}
        onClose={() => {
          setShowQuestionForm(false)
          setEditingQuestion(null)
        }}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
      >
        <QuestionForm
          onSubmit={editingQuestion ? () => {} : handleCreateQuestion}
          onCancel={() => {
            setShowQuestionForm(false)
            setEditingQuestion(null)
          }}
          initialData={editingQuestion}
          isEditing={!!editingQuestion}
          categoryName={selectedCategory?.name}
        />
      </Modal>
    </div>
  )
}

export default GameEditor
