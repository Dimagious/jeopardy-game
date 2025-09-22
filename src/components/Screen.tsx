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
      <header className="bg-jeopardy-blue p-6 glow-effect">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="screen-text-2xl text-shadow-xl animate-fade-in">Jeopardy Game</h1>
          <div className="screen-text-lg text-gray-300 text-shadow animate-slide-up">
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
                <div className="jeopardy-question min-h-[400px] flex flex-col justify-center text-center animate-fade-in glow-effect">
                  <div className="screen-text-3xl mb-8 text-shadow-xl animate-scale-in">
                    ${gameState.currentQuestion.value}
                  </div>
                  <div className="screen-text-2xl mb-8 text-shadow-lg animate-slide-up">
                    {gameState.currentQuestion.text}
                  </div>
                  {gameState.currentQuestion.showAnswer && (
                    <div className="jeopardy-answer animate-fade-in glow-effect-gold">
                      <div className="screen-text-xl mb-4 text-shadow">Ответ:</div>
                      <div className="screen-text-2xl text-shadow-lg">
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
