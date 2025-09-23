import { useGameStore } from '../shared/gameStore'
import { cn } from '../shared/utils'

interface ScreenBoardProps {
  className?: string
}

export default function ScreenBoard({ className }: ScreenBoardProps) {
  const { 
    categories, 
    questions,
    gameState,
    selectQuestion,
    getQuestionById,
    isQuestionAvailable
  } = useGameStore()

  const handleQuestionClick = (questionId: string) => {
    if (isQuestionAvailable(questionId)) {
      selectQuestion(questionId)
    }
  }

  const getQuestionForCell = (categoryId: string, value: number) => {
    return questions.find(q => q.categoryId === categoryId && q.value === value)
  }

  const isQuestionSelected = (questionId: string) => {
    return gameState?.currentQuestion?.id === questionId
  }

  const isQuestionDone = (questionId: string) => {
    const question = getQuestionById(questionId)
    return question?.isDone || false
  }

  return (
    <div className={cn('w-full h-full animate-fade-in flex flex-col', className)}>
      {/* Заголовки категорий */}
      <div className="grid grid-cols-5 gap-2 mb-2 flex-shrink-0" role="grid" aria-label="Игровое поле Jeopardy">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="jeopardy-board p-2 text-center h-12 flex items-center justify-center animate-slide-up glow-effect"
            style={{ animationDelay: `${index * 0.1}s` }}
            role="columnheader"
            aria-label={`Категория: ${category.name}`}
          >
            <h3 className="text-xs font-bold leading-tight text-shadow">
              {category.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Сетка вопросов */}
      <div className="grid grid-cols-5 gap-2 flex-1 grid-rows-5" role="grid" aria-label="Сетка вопросов">
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
                  'jeopardy-cell flex items-center justify-center text-sm font-bold transition-all duration-300',
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
                role="gridcell"
                aria-label={`${category.name}, ${value} долларов${isDone ? ', отвечен' : isSelected ? ', выбран' : ''}`}
                aria-disabled={!isAvailable}
                tabIndex={isAvailable ? 0 : -1}
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
}
