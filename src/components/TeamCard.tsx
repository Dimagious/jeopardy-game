import React from 'react'
import { Team } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

interface TeamCardProps {
  team: Team
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <Card className="bg-white shadow-md rounded-lg p-4 border-l-4" style={{ borderLeftColor: team.color }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: team.color }}
          ></div>
          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
        </div>
        <div className="text-sm text-gray-500">
          Order: {team.order}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isFirst && onMoveUp && (
            <Button
              onClick={onMoveUp}
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1"
            >
              ↑
            </Button>
          )}
          {!isLast && onMoveDown && (
            <Button
              onClick={onMoveDown}
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1"
            >
              ↓
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onEdit}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Edit
          </Button>
          <Button
            onClick={onDuplicate}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Duplicate
          </Button>
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
