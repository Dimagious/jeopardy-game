import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { analytics } from '../shared/analytics'

export default function HostPage() {
  const { gameId } = useParams<{ gameId: string }>()

  useEffect(() => {
    if (gameId) {
      analytics.hostPageView(gameId)
    }
  }, [gameId])

  return (
    <div className="min-h-screen bg-jeopardy-dark text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-display-2 text-white">Пульт ведущего</h1>
          <p className="text-gray-400">Игра: {gameId}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Игровое поле</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {/* Categories */}
                  {['Категория 1', 'Категория 2', 'Категория 3', 'Категория 4', 'Категория 5'].map((category, i) => (
                    <div key={`cat-${i}`} className="jeopardy-board p-3 text-center">
                      <h3 className="text-sm font-bold">{category}</h3>
                    </div>
                  ))}
                  
                  {/* Questions */}
                  {Array.from({ length: 20 }, (_, i) => (
                    <button
                      key={i}
                      className="jeopardy-board aspect-square hover:bg-blue-500 transition-colors flex items-center justify-center text-lg font-bold"
                    >
                      ${100 * (Math.floor(i / 4) + 1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          <div className="space-y-6">
            {/* Question Display */}
            <Card>
              <CardHeader>
                <CardTitle>Вопрос</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="jeopardy-question min-h-[200px] flex items-center justify-center">
                  <p className="text-gray-300">Выберите ячейку на поле</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Answer Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Управление</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="success" className="w-full">
                  Показать ответ
                </Button>
                <Button variant="primary" className="w-full">
                  Верно
                </Button>
                <Button variant="danger" className="w-full">
                  Неверно
                </Button>
                <Button variant="secondary" className="w-full">
                  Назад
                </Button>
              </CardContent>
            </Card>
            
            {/* Scoreboard */}
            <Card>
              <CardHeader>
                <CardTitle>Счёт команд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Команда 1', score: 0, color: 'bg-red-500' },
                    { name: 'Команда 2', score: 0, color: 'bg-blue-500' },
                    { name: 'Команда 3', score: 0, color: 'bg-green-500' },
                  ].map((team, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                        <span>{team.name}</span>
                      </div>
                      <span className="font-bold text-jeopardy-gold">${team.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
