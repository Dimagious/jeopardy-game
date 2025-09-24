import React, { useState, useEffect } from 'react'
import { Team, CreateTeamRequest, UpdateTeamRequest } from '../shared/types'
import Button from '../ui/Button'

interface TeamFormProps {
  initialData?: Team | null
  onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => void
  onCancel: () => void
  isLoading?: boolean
  disabled?: boolean
}

const PREDEFINED_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
]

export const TeamForm: React.FC<TeamFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    order: 1
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        color: initialData.color,
        order: initialData.order
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Team name must be less than 50 characters'
    }

    if (!formData.color) {
      newErrors.color = 'Team color is required'
    }

    if (formData.order < 1) {
      newErrors.order = 'Order must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      name: formData.name.trim(),
      color: formData.color,
      order: formData.order
    }

    onSubmit(submitData)
  }

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
    setErrors(prev => ({ ...prev, color: '' }))
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }))
    setErrors(prev => ({ ...prev, name: '' }))
  }

  const handleOrderChange = (order: number) => {
    setFormData(prev => ({ ...prev, order }))
    setErrors(prev => ({ ...prev, order: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-2">
          Team Name *
        </label>
        <input
          id="team-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter team name"
          disabled={disabled}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Color *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color
                  ? 'border-gray-800 shadow-lg'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color }}
              disabled={disabled}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            disabled={disabled}
          />
          <span className="text-sm text-gray-600">Custom color</span>
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      <div>
        <label htmlFor="team-order" className="block text-sm font-medium text-gray-700 mb-2">
          Order
        </label>
        <input
          id="team-order"
          type="number"
          min="1"
          value={formData.order}
          onChange={(e) => handleOrderChange(parseInt(e.target.value) || 1)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.order ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={disabled}
        />
        {errors.order && (
          <p className="mt-1 text-sm text-red-600">{errors.order}</p>
        )}
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading || disabled}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Team' : 'Create Team'}
        </Button>
      </div>
    </form>
  )
}
