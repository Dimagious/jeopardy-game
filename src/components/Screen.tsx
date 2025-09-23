import { memo } from 'react'
import { useGameStore } from '../shared/gameStore'
import ScreenBoard from './ScreenBoard'
import Scoreboard from './Scoreboard'
import { cn } from '../shared/utils'

interface ScreenProps {
  className?: string
}

const Screen = memo(function Screen({ className }: ScreenProps) {
  const { gameState, getCategoryById } = useGameStore()

  return (
    <div className={cn('h-screen flex flex-col', className)}>
      {/* Заголовок */}
      <header className="bg-jeopardy-blue p-4 glow-effect flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white text-shadow-xl animate-fade-in">Jeopardy Game</h1>
          <div className="text-lg text-gray-300 text-shadow animate-slide-up">
            {gameState?.currentQuestion && (
              <>
                {getCategoryById(gameState.currentQuestion.categoryId)?.name} - 
                {gameState.currentQuestion.value}$
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Основной контент */}
      <main className="flex-1 flex min-h-0">
        {/* Игровое поле или вопрос */}
        <div className="flex-1 flex flex-col min-h-0">
          {gameState?.currentQuestion ? (
            // Отображение текущего вопроса
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-4xl w-full">
                <div className="jeopardy-question min-h-[400px] flex flex-col justify-center text-center animate-fade-in glow-effect">
                  <div className="text-4xl font-bold mb-6 text-white text-shadow-xl animate-scale-in">
                    {gameState.currentQuestion.value}$
                  </div>
                  <div className="text-2xl font-semibold mb-6 text-white text-shadow-lg animate-slide-up leading-relaxed">
                    {gameState.currentQuestion.text}
                  </div>
                  {gameState.currentQuestion.showAnswer && (
                    <div className="jeopardy-answer animate-fade-in glow-effect-gold">
                      <div className="text-xl mb-3 text-white text-shadow">Ответ:</div>
                      <div className="text-2xl font-bold text-white text-shadow-lg">
                        {gameState.currentQuestion.answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Игровое поле
            <div className="flex-1 p-4 min-h-0">
              <ScreenBoard />
            </div>
          )}
        </div>
        
        {/* Табло команд */}
        <div className="w-72 bg-jeopardy-blue p-4 flex-shrink-0">
          <Scoreboard variant="screen" />
        </div>
      </main>
    </div>
  )
})

export default Screen
