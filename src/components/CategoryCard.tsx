import React from 'react'
import { Category } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

interface CategoryCardProps {
  category: Category
  questionsCount: number
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  onSelect?: () => void
  isSelected?: boolean
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  questionsCount,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  onSelect,
  isSelected = false,
}) => {
  return (
    <Card 
      className={`bg-white shadow-md rounded-lg p-4 border-l-4 cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      }`} 
      style={{ borderLeftColor: category.color || '#3B82F6' }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          {category.color && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: category.color }}
              title={`Color: ${category.color}`}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {questionsCount} {questionsCount === 1 ? 'question' : 'questions'}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Order: {category.order}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {!isFirst && onMoveUp && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onMoveUp}
              title="Move up"
            >
              ↑
            </Button>
          )}
          {!isLast && onMoveDown && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onMoveDown}
              title="Move down"
            >
              ↓
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDuplicate}
          >
            Duplicate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
