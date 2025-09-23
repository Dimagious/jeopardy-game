import { memo, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useGameStore } from '../shared/gameStore'
import { useSessionStore } from '../shared/sessionStore'
import { cn } from '../shared/utils'

interface BuzzerPanelProps {
  className?: string
  gameId?: string
}

const BuzzerPanel = memo(function BuzzerPanel({ className, gameId }: BuzzerPanelProps) {
  const {
    gameState,
    teams,
    selectTeam,
    toggleAnswer,
    judgeAnswer,
    getTeamScore,
    exportResults,
    resetCurrentQuestion,
  } = useGameStore()

  const {
    currentSession,
    createSession,
    stopSession
  } = useSessionStore()

  const [buzzWinner, setBuzzWinner] = useState<string | null>(null)
  const [buzzTimer, setBuzzTimer] = useState<number | null>(null)

  const selectedTeam = gameState?.selectedTeam

  // Запуск сессии
  const startSession = () => {
    if (!gameId) {
      console.error('GameId is required to start session')
      return
    }
    
    const session = createSession(gameId, 50) // Максимум 50 игроков
    console.log('Session started with PIN:', session.pin)
  }

  // Остановка сессии
  const handleStopSession = () => {
    if (currentSession) {
      stopSession(currentSession.id)
      setBuzzWinner(null)
      setBuzzTimer(null)
      console.log('Session stopped')
    }
  }

  // Демо-функциональность отключена - только реальные игроки

  // Симуляция buzz события (для демо)
  const simulateBuzz = () => {
    if (currentSession && currentSession.players.length > 0 && !buzzWinner) {
      const winner = currentSession.players[Math.floor(Math.random() * currentSession.players.length)]
      if (winner) {
        setBuzzWinner(winner.name)
        setBuzzTimer(3) // 3 секунды на ответ
      }
      
      // Таймер обратного отсчета
      const timer = setInterval(() => {
        setBuzzTimer(prev => {
          if (prev && prev > 1) {
            return prev - 1
          } else {
            clearInterval(timer)
            return null
          }
        })
      }, 1000)
    }
  }

  return (
    <div className={className}>
      {/* Управление сессией */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Buzzer Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentSession?.isActive ? (
            <div className="space-y-4">
              <p className="text-gray-300">
                Запустите сессию, чтобы участники могли подключиться по PIN
              </p>
              <Button 
                onClick={startSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                🚀 Начать сессию
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900 p-4 rounded-lg border border-green-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-100 mb-2">
                    PIN: {currentSession.pin}
                  </div>
                  <div className="text-sm text-green-300">
                    Участники подключаются по ссылке: /p/{currentSession.pin}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleStopSession}
                variant="secondary"
                className="w-full"
              >
                🛑 Остановить сессию
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Подключенные игроки */}
      {currentSession?.isActive && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Подключенные игроки ({currentSession.players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSession.players.length > 0 ? (
              <div className="space-y-2">
                {currentSession.players.map((player, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded"
                  >
                    <span className="text-white">{player.name}</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>Ожидание подключения игроков...</p>
                <p className="text-sm mt-2">
                  Игроки подключаются по ссылке: <br/>
                  <span className="font-mono text-jeopardy-gold">/p/{currentSession.pin}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Buzzer кнопка - только для реальных игроков */}
      {currentSession?.isActive && currentSession.players.length > 0 && gameState?.currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Жужалка</CardTitle>
          </CardHeader>
          <CardContent>
            {buzzWinner ? (
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-yellow-400">
                  🏆 Первый: {buzzWinner}
                </div>
                {buzzTimer && (
                  <div className="text-lg text-gray-300">
                    Время на ответ: {buzzTimer}с
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setBuzzWinner(null)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Сбросить
                  </Button>
                  <Button 
                    onClick={() => {
                      setBuzzWinner(null)
                      setBuzzTimer(null)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Следующий вопрос
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  onClick={simulateBuzz}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-lg py-4"
                >
                  🎯 Симулировать buzz (тест)
                </Button>
                <p className="text-sm text-gray-400 mt-2">
                  Только для тестирования. В реальной игре игроки нажимают кнопку на своих устройствах
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Отображение текущего вопроса */}
      {gameState?.currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Вопрос</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-fade-in">
              <div className="jeopardy-question min-h-[200px] flex flex-col justify-center animate-scale-in glow-effect">
                <div className="text-lg font-semibold mb-2 text-shadow animate-slide-up">
                  {gameState.currentQuestion.value}$
                </div>
                <div className="text-xl mb-4 text-shadow animate-slide-up">
                  {gameState.currentQuestion.text}
                </div>
                {gameState.currentQuestion.showAnswer && (
                  <div className="jeopardy-answer mt-4 animate-fade-in glow-effect-gold">
                    <div className="text-lg font-semibold mb-2 text-shadow">Ответ:</div>
                    <div className="text-xl text-shadow">
                      {gameState.currentQuestion.answer}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {gameState.currentQuestion.categoryId}
                </div>
                <Button
                  onClick={toggleAnswer}
                  variant="secondary"
                  size="sm"
                >
                  {gameState.currentQuestion.showAnswer ? 'Скрыть ответ' : 'Показать ответ'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Управление командами */}
      {gameState?.currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Выберите команду</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams.map((team) => {
                const score = getTeamScore(team.id)
                const isSelected = selectedTeam === team.id
                
                return (
                  <Button
                    key={team.id}
                    onClick={() => selectTeam(team.id)}
                    className={cn(
                      "w-full justify-between p-4 h-auto",
                      isSelected 
                        ? "bg-jeopardy-gold text-jeopardy-dark font-bold" 
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    )}
                  >
                    <span>{team.name}</span>
                    <span className="font-bold text-jeopardy-gold">
                      {score}$
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки управления */}
      {gameState?.currentQuestion && selectedTeam && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Оцените ответ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={() => judgeAnswer(selectedTeam, true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                ✅ Верно
              </Button>
              <Button
                onClick={() => judgeAnswer(selectedTeam, false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                ❌ Неверно
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Навигация */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={resetCurrentQuestion}
          className="flex-1"
        >
          ← Назад к полю
        </Button>
        <Button
          variant="secondary"
          onClick={exportResults}
          className="flex-1"
        >
          📊 Экспорт в CSV
        </Button>
      </div>
    </div>
  )
})

export default BuzzerPanel
