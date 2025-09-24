import React, { useState, useEffect } from 'react'
import { CreateQuestionRequest, UpdateQuestionRequest, Question } from '../shared/types'
import Button from '../ui/Button'

interface QuestionFormProps {
  onSubmit: (data: CreateQuestionRequest | UpdateQuestionRequest) => void
  onCancel: () => void
  initialData?: Question | null
  isEditing?: boolean
  existingValues?: number[]
  categoryName?: string | undefined
}

const VALUE_PRESETS = [100, 200, 300, 400, 500, 600, 800, 1000]

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  existingValues = [],
  categoryName,
}) => {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    value: 100,
    text: '',
    answer: '',
    order: 1,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        value: initialData.value,
        text: initialData.text,
        answer: initialData.answer,
        order: initialData.order,
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0'
    } else if (existingValues.includes(formData.value) && (!initialData || initialData.value !== formData.value)) {
      newErrors.value = `Value $${formData.value} already exists in this category`
    }

    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required'
    } else if (formData.text.length > 1000) {
      newErrors.text = 'Question text must be less than 1000 characters'
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required'
    } else if (formData.answer.length > 500) {
      newErrors.answer = 'Answer must be less than 500 characters'
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

  const handleInputChange = (field: keyof CreateQuestionRequest, value: string | number) => {
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

  const handleValueChange = (value: number) => {
    handleInputChange('value', value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {categoryName && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <p>Adding question to: <strong>{categoryName}</strong></p>
        </div>
      )}

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
          Value *
        </label>
        <div className="space-y-2">
          <input
            type="number"
            id="value"
            value={formData.value || ''}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter question value"
            min="1"
            step="100"
          />
          
          <div className="flex flex-wrap gap-2">
            {VALUE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleValueChange(preset)}
                className={`px-3 py-1 text-sm rounded border ${
                  formData.value === preset
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>
          
          {errors.value && (
            <p className="text-sm text-red-600">{errors.value}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
          Question Text *
        </label>
        <textarea
          id="text"
          value={formData.text}
          onChange={(e) => handleInputChange('text', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.text ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter the question text"
          rows={3}
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{errors.text || ''}</span>
          <span>{formData.text.length}/1000</span>
        </div>
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
          Answer *
        </label>
        <textarea
          id="answer"
          value={formData.answer}
          onChange={(e) => handleInputChange('answer', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.answer ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter the correct answer"
          rows={2}
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{errors.answer || ''}</span>
          <span>{formData.answer.length}/500</span>
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEditing ? 'Update Question' : 'Create Question'}
        </Button>
      </div>
    </form>
  )
}
