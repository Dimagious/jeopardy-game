import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import { Board, HostPanel, Scoreboard } from '../components'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function HostPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { initializeGame } = useGameStore()

  useEffect(() => {
    if (gameId) {
      analytics.hostPageView(gameId)
      initializeGame(gameId)
    }
  }, [gameId, initializeGame])

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
                <Board />
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          <div className="space-y-6">
            <HostPanel />
            
            {/* Scoreboard */}
            <Card>
              <CardHeader>
                <CardTitle>Счёт команд</CardTitle>
              </CardHeader>
              <CardContent>
                <Scoreboard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
