import { useGameStore } from '../shared/gameStore'
import Board from './Board'
import Scoreboard from './Scoreboard'
import { cn } from '../shared/utils'

interface ScreenProps {
  className?: string
}

export default function Screen({ className }: ScreenProps) {
  const { gameState, getCategoryById } = useGameStore()

  return (
    <div className={cn('h-screen flex flex-col', className)}>
      {/* Заголовок */}
      <header className="bg-jeopardy-blue p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="screen-text-xl">Jeopardy Game</h1>
          <div className="text-lg text-gray-300">
            {gameState?.currentQuestion && (
              <>
                {getCategoryById(gameState.currentQuestion.categoryId)?.name} - 
                ${gameState.currentQuestion.value}
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Основной контент */}
      <main className="flex-1 flex safe-area">
        {/* Игровое поле или вопрос */}
        <div className="flex-1 flex flex-col">
          {gameState?.currentQuestion ? (
            // Отображение текущего вопроса
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <div className="jeopardy-question min-h-[400px] flex flex-col justify-center text-center">
                  <div className="screen-text-2xl mb-8">
                    ${gameState.currentQuestion.value}
                  </div>
                  <div className="screen-text-xl mb-8">
                    {gameState.currentQuestion.text}
                  </div>
                  {gameState.currentQuestion.showAnswer && (
                    <div className="jeopardy-answer">
                      <div className="screen-text-lg mb-4">Ответ:</div>
                      <div className="screen-text-xl">
                        {gameState.currentQuestion.answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Игровое поле
            <div className="flex-1 p-8">
              <Board />
            </div>
          )}
        </div>
        
        {/* Табло команд */}
        <div className="w-96 bg-jeopardy-blue p-8 ml-8">
          <Scoreboard variant="screen" />
        </div>
      </main>
    </div>
  )
}
