import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import { Board, HostPanel, Scoreboard } from '../components'
import GameRestoreModal from '../components/GameRestoreModal'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function HostPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { 
    initializeGame, 
    hasActiveGame, 
    clearGame, 
    createAutoSnapshot 
  } = useGameStore()
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (gameId && !isInitialized) {
      analytics.hostPageView(gameId)
      
      // Проверяем, есть ли активная игра
      if (hasActiveGame()) {
        setShowRestoreModal(true)
      } else {
        initializeGame(gameId)
        setIsInitialized(true)
      }
    }
  }, [gameId, initializeGame, hasActiveGame, isInitialized])

  // Автоснапшоты каждые 10 секунд
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        createAutoSnapshot()
      }, 10000) // 10 секунд

      return () => clearInterval(interval)
    }
  }, [isInitialized, createAutoSnapshot])

  const handleContinueGame = () => {
    setShowRestoreModal(false)
    setIsInitialized(true)
  }

  const handleNewGame = () => {
    clearGame()
    if (gameId) {
      initializeGame(gameId)
    }
    setShowRestoreModal(false)
    setIsInitialized(true)
  }

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

      {/* Модальное окно восстановления игры */}
      <GameRestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onContinue={handleContinueGame}
        onNewGame={handleNewGame}
      />
    </div>
  )
}
