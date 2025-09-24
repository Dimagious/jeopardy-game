import React from 'react'
import { QuestionPack } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

interface PackCardProps {
  pack: QuestionPack
  stats?: {
    categoriesCount: number
    questionsCount: number
    totalValue: number
    averageValue: number
  }
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onImport?: () => void
  showImportButton?: boolean
}

export const PackCard: React.FC<PackCardProps> = ({
  pack,
  stats,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onImport,
  showImportButton = false,
}) => {
  return (
    <Card className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{pack.title}</h3>
            {pack.isPublic && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Public
              </span>
            )}
          </div>
          {pack.description && (
            <p className="text-gray-600 text-sm mb-3">{pack.description}</p>
          )}
          
          {/* Теги */}
          {pack.tags && pack.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {pack.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Статистика */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Categories:</span> {stats.categoriesCount}
              </div>
              <div>
                <span className="font-medium">Questions:</span> {stats.questionsCount}
              </div>
              <div>
                <span className="font-medium">Total Value:</span> ${stats.totalValue}
              </div>
              <div>
                <span className="font-medium">Avg Value:</span> ${Math.round(stats.averageValue)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Created {new Date(pack.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onView}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View
          </Button>
          <Button
            onClick={onEdit}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Edit
          </Button>
          <Button
            onClick={onDuplicate}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Duplicate
          </Button>
          {showImportButton && onImport && (
            <Button
              onClick={onImport}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Import
            </Button>
          )}
          <Button
            onClick={onDelete}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
