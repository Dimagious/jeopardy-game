import React, { useState } from 'react'
import { CreateGameRequest } from '../shared/types'
import Button from '../ui/Button'

interface GameFormProps {
  onSubmit: (gameData: CreateGameRequest) => void
  onCancel: () => void
  limits?: {
    currentGames: number
    maxGames: number
    canCreate: boolean
  } | null
  initialData?: Partial<CreateGameRequest>
}

export function GameForm({ onSubmit, onCancel, limits, initialData }: GameFormProps) {
  const [formData, setFormData] = useState<CreateGameRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    settings: {
      gridRows: initialData?.settings?.gridRows || 5,
      gridCols: initialData?.settings?.gridCols || 5,
      maxTeams: initialData?.settings?.maxTeams || 4,
      gameMode: initialData?.settings?.gameMode || 'jeopardy'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (formData.settings.gridRows < 3 || formData.settings.gridRows > 6) {
      newErrors.gridRows = 'Grid rows must be between 3 and 6'
    }

    if (formData.settings.gridCols < 3 || formData.settings.gridCols > 6) {
      newErrors.gridCols = 'Grid columns must be between 3 and 6'
    }

    if (formData.settings.maxTeams < 2 || formData.settings.maxTeams > 8) {
      newErrors.maxTeams = 'Max teams must be between 2 and 8'
    }

    // Проверка лимитов плана
    if (limits && !limits.canCreate) {
      newErrors.limits = `You have reached the limit of ${limits.maxGames} games. Upgrade your plan to create more games.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSettingsChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }))
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Game Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter game title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter game description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Game Mode */}
      <div>
        <label htmlFor="gameMode" className="block text-sm font-medium text-gray-700 mb-2">
          Game Mode
        </label>
        <select
          id="gameMode"
          value={formData.settings.gameMode}
          onChange={(e) => handleSettingsChange('gameMode', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="jeopardy">Classic Jeopardy</option>
          <option value="buzzer">Buzzer Mode</option>
        </select>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gridRows" className="block text-sm font-medium text-gray-700 mb-2">
            Grid Rows
          </label>
          <input
            type="number"
            id="gridRows"
            min="3"
            max="6"
            value={formData.settings.gridRows}
            onChange={(e) => handleSettingsChange('gridRows', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gridRows ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.gridRows && (
            <p className="mt-1 text-sm text-red-600">{errors.gridRows}</p>
          )}
        </div>

        <div>
          <label htmlFor="gridCols" className="block text-sm font-medium text-gray-700 mb-2">
            Grid Columns
          </label>
          <input
            type="number"
            id="gridCols"
            min="3"
            max="6"
            value={formData.settings.gridCols}
            onChange={(e) => handleSettingsChange('gridCols', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gridCols ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.gridCols && (
            <p className="mt-1 text-sm text-red-600">{errors.gridCols}</p>
          )}
        </div>
      </div>

      {/* Max Teams */}
      <div>
        <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-2">
          Max Teams
        </label>
        <input
          type="number"
          id="maxTeams"
          min="2"
          max="8"
          value={formData.settings.maxTeams}
          onChange={(e) => handleSettingsChange('maxTeams', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.maxTeams ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.maxTeams && (
          <p className="mt-1 text-sm text-red-600">{errors.maxTeams}</p>
        )}
      </div>

      {/* Plan Limits Warning */}
      {limits && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You have {limits.currentGames} of {limits.maxGames} games used.
                {!limits.canCreate && ' Upgrade your plan to create more games.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Errors */}
      {errors.limits && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{errors.limits}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={limits ? !limits.canCreate : false}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Game
        </Button>
      </div>
    </form>
  )
}
