import React from 'react'
import { Question } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

interface QuestionCardProps {
  question: Question
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  const formatValue = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  const getStatusColor = () => {
    if (question.isDone) return 'bg-green-100 text-green-800'
    if (question.isLocked) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = () => {
    if (question.isDone) return 'Done'
    if (question.isLocked) return 'Locked'
    return 'Available'
  }

  return (
    <Card className="bg-white shadow-md rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg font-bold text-blue-600">
              {formatValue(question.value)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Order: {question.order}
            </span>
          </div>
          
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Question:</h4>
              <p className="text-sm text-gray-900 line-clamp-2">
                {question.text}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Answer:</h4>
              <p className="text-sm text-gray-900 line-clamp-2">
                {question.answer}
              </p>
            </div>
          </div>
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
