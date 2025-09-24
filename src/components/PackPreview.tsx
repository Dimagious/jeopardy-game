import React from 'react'
import { PackPreview as PackPreviewType } from '../shared/types'
import Button from '../ui/Button'

interface PackPreviewProps {
  preview: PackPreviewType
  onImport?: () => void
  onClose?: () => void
  showImportButton?: boolean
}

export const PackPreview: React.FC<PackPreviewProps> = ({
  preview,
  onImport,
  onClose,
  showImportButton = false,
}) => {
  const { pack, categories, questions, stats } = preview

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{pack.title}</h2>
              {pack.isPublic && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Public
                </span>
              )}
            </div>
            {pack.description && (
              <p className="text-gray-600 text-lg">{pack.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {showImportButton && onImport && (
              <Button
                onClick={onImport}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                Import to Game
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.categoriesCount}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.questionsCount}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.totalValue}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">${Math.round(stats.averageValue)}</div>
            <div className="text-sm text-gray-600">Average Value</div>
          </div>
        </div>
      </div>

      {/* Categories and Questions */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories and Questions</h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryQuestions = questions.filter(q => q.packCategoryId === category.id)
            return (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                  <span className="text-sm text-gray-500">
                    {categoryQuestions.length} questions
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryQuestions.map((question) => (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-600">${question.value}</span>
                        <span className="text-xs text-gray-500">#{question.order}</span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{question.text}</div>
                      <div className="text-xs text-gray-500">
                        <strong>Answer:</strong> {question.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
