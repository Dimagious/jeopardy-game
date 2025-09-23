import { memo, useState, useEffect, useCallback } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useGameStore } from '../shared/gameStore'
import { useSessionStore } from '../shared/sessionStore'
import { analytics } from '../shared/analytics'
import { cn } from '../shared/utils'
// import { buzzDebouncer } from '../shared/rateLimiter' // Пока не используется

interface BuzzerPanelProps {
  className?: string
  gameId: string
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
    stopSession,
    getBuzzState,
    unlockBuzz,
    resetBuzz,
    assignPlayerToTeam,
    removePlayerFromTeam,
    getPlayersByTeam,
    getUnassignedPlayers,
    getPlayerTeam
  } = useSessionStore()

  const [buzzTimer, setBuzzTimer] = useState<number | null>(null)
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null)

  const selectedTeam = gameState?.selectedTeam

  // Отслеживание buzz состояния
  useEffect(() => {
    if (currentSession) {
      const buzzState = getBuzzState(currentSession.id)
      if (buzzState?.isLocked && buzzState?.lockExpiresAt) {
        const timeLeft = Math.max(0, buzzState.lockExpiresAt - Date.now())
        if (timeLeft > 0) {
          setBuzzTimer(Math.ceil(timeLeft / 1000))
          
          const timer = setInterval(() => {
            const newTimeLeft = Math.max(0, buzzState.lockExpiresAt! - Date.now())
            if (newTimeLeft > 0) {
              setBuzzTimer(Math.ceil(newTimeLeft / 1000))
            } else {
              setBuzzTimer(null)
              clearInterval(timer)
            }
          }, 1000)
          
          return () => clearInterval(timer)
        }
      } else {
        setBuzzTimer(null)
      }
    }
  }, [currentSession, getBuzzState])

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
      setBuzzTimer(null)
      console.log('Session stopped')
    }
  }

  // Демо-функциональность отключена - только реальные игроки

  // Drag'n'drop функции
  const handleDragStart = useCallback((playerId: string) => {
    setDraggedPlayer(playerId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedPlayer(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, teamId: string) => {
    e.preventDefault()
    if (draggedPlayer && currentSession) {
      const player = currentSession.players.find(p => p.id === draggedPlayer)
      const team = teams.find(t => t.id === teamId)
      
      if (player && team) {
        assignPlayerToTeam(currentSession.id, draggedPlayer, teamId)
        analytics.playerAssignedToTeam(
          currentSession.id,
          player.id,
          player.name,
          teamId,
          team.name
        )
      }
    }
    setDraggedPlayer(null)
  }, [draggedPlayer, currentSession, assignPlayerToTeam, teams])

  const handleRemoveFromTeam = useCallback((playerId: string) => {
    if (currentSession) {
      const player = currentSession.players.find(p => p.id === playerId)
      const currentTeamId = getPlayerTeam(currentSession.id, playerId)
      
      if (player && currentTeamId) {
        const team = teams.find(t => t.id === currentTeamId)
        if (team) {
          removePlayerFromTeam(currentSession.id, playerId)
          analytics.playerRemovedFromTeam(
            currentSession.id,
            player.id,
            player.name,
            currentTeamId,
            team.name
          )
        }
      }
    }
  }, [currentSession, removePlayerFromTeam, getPlayerTeam, teams])

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

      {/* Управление командами */}
      {currentSession?.isActive && currentSession.players.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Распределение по командам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Команды */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => {
                  const teamPlayers = currentSession ? getPlayersByTeam(currentSession.id, team.id) : []
                  return (
                    <div
                      key={team.id}
                      className={cn(
                        "p-4 rounded-lg border-2 border-dashed transition-colors",
                        "bg-gray-800 border-gray-600 hover:border-blue-500"
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, team.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                        <span className="text-sm text-gray-400">{teamPlayers.length} игроков</span>
                      </div>
                      
                      <div className="space-y-2 min-h-[100px]">
                        {teamPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 bg-gray-700 rounded"
                          >
                            <span className="text-white">{player.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFromTeam(player.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                        
                        {teamPlayers.length === 0 && (
                          <div className="text-center text-gray-500 py-4">
                            Перетащите игроков сюда
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Неназначенные игроки */}
              {currentSession && getUnassignedPlayers(currentSession.id).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Неназначенные игроки</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getUnassignedPlayers(currentSession.id).map((player) => (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={() => handleDragStart(player.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "p-3 bg-gray-700 rounded cursor-move transition-all",
                          "hover:bg-gray-600 hover:shadow-md",
                          draggedPlayer === player.id && "opacity-50"
                        )}
                      >
                        <span className="text-white">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
            {(() => {
              const buzzState = currentSession ? getBuzzState(currentSession.id) : null
              const buzzWinner = buzzState?.winner
              
              if (buzzWinner) {
                return (
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-yellow-400">
                      🏆 Первый: {buzzWinner.name}
                    </div>
                    {buzzTimer && (
                      <div className="text-lg text-gray-300">
                        Время на ответ: {buzzTimer}с
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          if (currentSession) {
                            unlockBuzz(currentSession.id)
                          }
                        }}
                        variant="secondary"
                        className="flex-1"
                      >
                        Сбросить buzz
                      </Button>
                      <Button 
                        onClick={() => {
                          if (currentSession) {
                            resetBuzz(currentSession.id)
                            resetCurrentQuestion()
                          }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Следующий вопрос
                      </Button>
                    </div>
                  </div>
                )
              }
              
              return (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    Ожидание buzz от игроков...
                  </p>
                  <p className="text-sm text-gray-500">
                    Игроки нажимают кнопку "Я первый" на своих устройствах
                  </p>
                </div>
              )
            })()}
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
