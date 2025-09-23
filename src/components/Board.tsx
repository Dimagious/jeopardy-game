import { memo, useCallback } from 'react'
import { useGameStore } from '../shared/gameStore'
import { cn } from '../shared/utils'

interface BoardProps {
  className?: string
}

const Board = memo(function Board({ className }: BoardProps) {
  const {
    categories,
    questions,
    gameState,
    selectQuestion,
    getQuestionById,
    isQuestionAvailable,
  } = useGameStore()

  const handleQuestionClick = useCallback((questionId: string) => {
    if (isQuestionAvailable(questionId)) {
      selectQuestion(questionId)
    }
  }, [isQuestionAvailable, selectQuestion])

  const getQuestionForCell = useCallback((categoryId: string, value: number) => {
    return questions.find(q => q.categoryId === categoryId && q.value === value)
  }, [questions])

  const isQuestionSelected = useCallback((questionId: string) => {
    return gameState?.currentQuestion?.id === questionId
  }, [gameState?.currentQuestion?.id])

  const isQuestionDone = useCallback((questionId: string) => {
    const question = getQuestionById(questionId)
    return question?.isDone || false
  }, [getQuestionById])

  // Grid values are now hardcoded in the component for simplicity

  return (
    <div className={cn('w-full animate-fade-in', className)}>
      {/* Заголовки категорий */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="jeopardy-board p-3 text-center min-h-[60px] flex items-center justify-center animate-slide-up glow-effect"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3 className="text-sm font-bold leading-tight text-shadow">
              {category.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Сетка вопросов */}
      <div className="grid grid-cols-5 gap-3">
        {[100, 200, 300, 400, 500].map((value) => (
          categories.map((category) => {
            const question = getQuestionForCell(category.id, value)
            if (!question) return null

            const isSelected = isQuestionSelected(question.id)
            const isDone = isQuestionDone(question.id)
            const isAvailable = isQuestionAvailable(question.id)

            return (
              <button
                key={`${category.id}-${value}`}
                onClick={() => handleQuestionClick(question.id)}
                disabled={!isAvailable}
                className={cn(
                  'jeopardy-cell aspect-square flex items-center justify-center text-lg font-bold transition-all duration-300',
                  'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400',
                  'animate-scale-in',
                  {
                    'opacity-50 cursor-not-allowed': !isAvailable,
                    'animate-blink bg-yellow-400 text-black glow-effect-gold': isSelected,
                    'bg-gray-600 text-gray-300': isDone,
                    'hover:bg-blue-500 hover:shadow-xl': isAvailable && !isSelected,
                  }
                )}
                style={{ 
                  animationDelay: `${(value / 100 - 1) * 0.05 + (categories.indexOf(category)) * 0.02}s` 
                }}
              >
            <span className="text-shadow">
              {isDone ? '✓' : `${value}$`}
            </span>
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
})

export default Board
