import React, { useState, useEffect } from 'react'
import { CreateCategoryRequest, UpdateCategoryRequest, Category } from '../shared/types'
import Button from '../ui/Button'

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
  onCancel: () => void
  initialData?: Category | null
  isEditing?: boolean
  limits?: {
    current: number
    max: number
    canCreate: boolean
  } | null
}

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  limits,
}) => {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    color: '#3B82F6',
    order: 1,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        color: initialData.color || '#3B82F6',
        order: initialData.order,
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters'
    }

    if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = 'Invalid color format'
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

  const handleInputChange = (field: keyof CreateCategoryRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleColorChange = (color: string) => {
    handleInputChange('color', color)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter category name"
          maxLength={50}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Color
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#3B82F6"
            />
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded border-2 ${
                  formData.color === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          {errors.color && (
            <p className="text-sm text-red-600">{errors.color}</p>
          )}
        </div>
      </div>

      {!isEditing && (
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <input
            type="number"
            id="order"
            value={formData.order || ''}
            onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            placeholder="Auto-assigned if empty"
          />
        </div>
      )}

      {limits && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p>
            Categories: {limits.current} / {limits.max}
            {!limits.canCreate && (
              <span className="text-red-600 ml-2">(Limit reached)</span>
            )}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={limits ? !limits.canCreate : false}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
