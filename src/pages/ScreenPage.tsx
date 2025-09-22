import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { analytics } from '../shared/analytics'

export default function ScreenPage() {
  const { gameId } = useParams<{ gameId: string }>()

  useEffect(() => {
    if (gameId) {
      analytics.screenPageView(gameId)
    }
  }, [gameId])

  return (
    <div className="min-h-screen bg-jeopardy-dark text-white">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-jeopardy-blue p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="screen-text-xl">Jeopardy Game</h1>
            <div className="text-lg text-gray-300">Игра: {gameId}</div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex safe-area">
          {/* Game Board */}
          <div className="flex-1 flex flex-col">
            {/* Categories */}
            <div className="grid grid-cols-5 gap-6 mb-8">
              {['Категория 1', 'Категория 2', 'Категория 3', 'Категория 4', 'Категория 5'].map((category, i) => (
                <div key={i} className="jeopardy-board p-6 text-center">
                  <h3 className="screen-text-lg">{category}</h3>
                </div>
              ))}
            </div>
            
            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-6 flex-1">
              {Array.from({ length: 20 }, (_, i) => (
                <button
                  key={i}
                  className="jeopardy-board hover:bg-blue-500 transition-all duration-300 hover:scale-105 flex items-center justify-center screen-text-lg"
                >
                  ${100 * (Math.floor(i / 4) + 1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scoreboard */}
          <div className="w-96 bg-jeopardy-blue p-8 ml-8">
            <h2 className="screen-text-xl mb-8 text-center">Счёт команд</h2>
            <div className="space-y-6">
              {[
                { name: 'Команда 1', score: 0, color: 'bg-red-500' },
                { name: 'Команда 2', score: 0, color: 'bg-blue-500' },
                { name: 'Команда 3', score: 0, color: 'bg-green-500' },
              ].map((team, i) => (
                <div key={i} className="flex items-center space-x-6">
                  <div className={`w-6 h-6 rounded-full ${team.color}`}></div>
                  <div className="flex-1">
                    <div className="screen-text-lg">{team.name}</div>
                    <div className="screen-text-2xl text-jeopardy-gold">${team.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
