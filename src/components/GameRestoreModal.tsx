import { useState } from 'react'
import { Modal, Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useGameStore } from '../shared/gameStore'
import { cn } from '../shared/utils'

interface GameRestoreModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  onNewGame: () => void
}

export default function GameRestoreModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  onNewGame 
}: GameRestoreModalProps) {
  const { game, gameState, scoreEvents, teams, getTeamScore } = useGameStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      onContinue()
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewGame = async () => {
    setIsLoading(true)
    try {
      onNewGame()
    } finally {
      setIsLoading(false)
    }
  }

  if (!game || !gameState) return null

  const totalScore = teams.reduce((sum, team) => sum + getTeamScore(team.id), 0)
  const completedQuestions = scoreEvents.length
  const lastUpdated = new Date(gameState.lastUpdated).toLocaleString()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center animate-fade-in">
            Продолжить игру?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Информация о текущей игре */}
          <div className="bg-jeopardy-blue/10 p-4 rounded-lg animate-slide-up">
            <h3 className="text-lg font-semibold mb-3 text-jeopardy-gold">
              {game.title}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Последнее обновление:</span>
                <div className="font-semibold">{lastUpdated}</div>
              </div>
              <div>
                <span className="text-gray-400">Отвечено вопросов:</span>
                <div className="font-semibold">{completedQuestions}</div>
              </div>
              <div>
                <span className="text-gray-400">Общий счёт:</span>
                <div className="font-semibold text-jeopardy-gold">${totalScore}</div>
              </div>
              <div>
                <span className="text-gray-400">Статус:</span>
                <div className="font-semibold">
                  {gameState.currentQuestion ? 'Вопрос открыт' : 'Ожидание'}
                </div>
              </div>
            </div>
          </div>

          {/* Текущий вопрос (если есть) */}
          {gameState.currentQuestion && (
            <div className="bg-jeopardy-gold/10 p-4 rounded-lg animate-scale-in">
              <h4 className="font-semibold mb-2 text-jeopardy-gold">Текущий вопрос:</h4>
              <div className="text-sm">
                <div className="font-semibold">${gameState.currentQuestion.value}</div>
                <div className="text-gray-600 mt-1">
                  {gameState.currentQuestion.text}
                </div>
              </div>
            </div>
          )}

          {/* Счёт команд */}
          <div className="animate-fade-in">
            <h4 className="font-semibold mb-3">Счёт команд:</h4>
            <div className="space-y-2">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      {
                        'bg-red-500': team.order === 1,
                        'bg-blue-500': team.order === 2,
                        'bg-green-500': team.order === 3,
                      }
                    )}></div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <span className="font-bold text-jeopardy-gold">
                    ${getTeamScore(team.id)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-4 pt-4 animate-slide-up">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1 bg-jeopardy-blue hover:bg-blue-700"
            >
              {isLoading ? 'Загрузка...' : 'Продолжить игру'}
            </Button>
            <Button
              onClick={handleNewGame}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              {isLoading ? 'Загрузка...' : 'Новая игра'}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 animate-fade-in">
            Игра автоматически сохраняется каждые 10 секунд
          </div>
        </CardContent>
      </Card>
    </Modal>
  )
}
