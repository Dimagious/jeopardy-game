import React from 'react'
import { Game } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

interface GameCardProps {
  game: Game
  onEdit: () => void
  onView: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function GameCard({ game, onEdit, onView, onDuplicate, onDelete }: GameCardProps) {
  const getStatusColor = (status: Game['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Game['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'archived':
        return 'Archived'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {game.title}
          </h3>
          {game.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {game.description}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
          {getStatusText(game.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Mode:</span>
          <span className="ml-2 capitalize">{game.settings.gameMode}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Grid:</span>
          <span className="ml-2">{game.settings.gridRows}×{game.settings.gridCols}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Max Teams:</span>
          <span className="ml-2">{game.settings.maxTeams}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Created:</span>
          <span className="ml-2">{formatDate(game.createdAt)}</span>
        </div>
        {game.updatedAt !== game.createdAt && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Updated:</span>
            <span className="ml-2">{formatDate(game.updatedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={onView}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
        >
          View
        </Button>
        <Button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Edit
        </Button>
        <Button
          onClick={onDuplicate}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm"
        >
          Duplicate
        </Button>
        {game.status === 'draft' && (
          <Button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 font-semibold border-2 border-red-500 hover:border-red-600"
            title="⚠️ PERMANENT DELETE - This will delete all categories, questions, and teams!"
          >
            🗑️ Delete
          </Button>
        )}
      </div>
    </Card>
  )
}
