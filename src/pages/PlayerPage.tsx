import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useSessionStore, sessionUtils } from '../shared/sessionStore'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function PlayerPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { getSessionById, addPlayer, getPlayersCount } = useSessionStore()
  const { gameState, getQuestionById, getCategoryById } = useGameStore()
  
  const [playerName, setPlayerName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const session = sessionId ? getSessionById(sessionId) : null

  useEffect(() => {
    if (sessionId) {
      analytics.playerPageView(sessionId)
    }
  }, [sessionId])

  const handleJoinSession = async () => {
    if (!sessionId || !playerName.trim()) {
      setError('Введите имя для участия')
      return
    }

    if (!sessionUtils.isValidPlayerName(playerName)) {
      setError('Имя должно быть от 2 до 20 символов')
      return
    }

    if (!session) {
      setError('Сессия не найдена')
      return
    }

    if (!session.isActive) {
      setError('Сессия неактивна')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const player = addPlayer(sessionId, playerName.trim())
      setCurrentPlayer(player)
      setIsJoined(true)
      analytics.playerJoined(sessionId, player.id, player.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value)
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleJoinSession()
    }
  }

  // Если сессия не найдена
  if (!session) {
    return (
      <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Сессия не найдена</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Сессия с ID {sessionId} не существует или была завершена.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Если сессия неактивна
  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-yellow-400">Сессия завершена</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Эта сессия была завершена ведущим.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Если игрок еще не присоединился
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-jeopardy-gold">
              Присоединиться к игре
            </CardTitle>
            <p className="text-center text-gray-400">
              PIN: <span className="font-mono text-2xl font-bold text-jeopardy-gold">{session.pin}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                Ваше имя
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                placeholder="Введите ваше имя"
                className="w-full px-3 py-2 bg-jeopardy-card-bg border border-jeopardy-gold/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold focus:border-transparent"
                maxLength={20}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              onClick={handleJoinSession}
              disabled={!playerName.trim() || isLoading}
              className="w-full bg-jeopardy-gold hover:bg-jeopardy-gold/90 text-jeopardy-dark font-semibold"
            >
              {isLoading ? 'Подключение...' : 'Присоединиться'}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Участников: {getPlayersCount(sessionId || '')} / {session.maxPlayers || '∞'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Основной интерфейс игрока
  const currentQuestion = gameState?.currentQuestion ? getQuestionById(gameState.currentQuestion.id) : null
  const currentCategory = currentQuestion ? getCategoryById(currentQuestion.categoryId) : null

  return (
    <div className="min-h-screen bg-jeopardy-dark text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Заголовок */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-jeopardy-gold mb-2">
            Добро пожаловать, {currentPlayer?.name}!
          </h1>
          <p className="text-gray-400">
            PIN: <span className="font-mono text-xl font-bold text-jeopardy-gold">{session.pin}</span>
          </p>
        </header>

        {/* Статус игры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-jeopardy-card-bg border-jeopardy-gold/20">
            <CardHeader>
              <CardTitle className="text-jeopardy-gold">Статус игры</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Текущий вопрос:</p>
                  <p className="font-semibold">{currentCategory?.name}</p>
                  <p className="text-jeopardy-gold font-bold">${currentQuestion.value}</p>
                </div>
              ) : (
                <p className="text-gray-400">Ожидание начала игры...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-jeopardy-card-bg border-jeopardy-gold/20">
            <CardHeader>
              <CardTitle className="text-jeopardy-gold">Участники</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-jeopardy-gold">
                {getPlayersCount(sessionId || '')}
              </p>
              <p className="text-sm text-gray-400">в игре</p>
            </CardContent>
          </Card>
        </div>

        {/* Кнопка "Я первый" (будет активна только когда ведущий откроет вопрос) */}
        {currentQuestion && (
          <Card className="bg-jeopardy-card-bg border-jeopardy-gold/20 mb-8">
            <CardHeader>
              <CardTitle className="text-center text-jeopardy-gold">Готовы отвечать?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                className="w-full h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => {
                  // TODO: Реализовать buzz функциональность в US-102
                  console.log('Buzz!', currentPlayer?.id)
                }}
              >
                🚨 Я ПЕРВЫЙ! 🚨
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Нажмите, когда будете готовы отвечать на вопрос
              </p>
            </CardContent>
          </Card>
        )}

        {/* Информация о сессии */}
        <Card className="bg-jeopardy-card-bg border-jeopardy-gold/20">
          <CardHeader>
            <CardTitle className="text-jeopardy-gold">Информация о сессии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Сессия:</p>
                <p className="font-mono">{sessionId}</p>
              </div>
              <div>
                <p className="text-gray-400">Создана:</p>
                <p>{new Date(session.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Статус:</p>
                <p className="text-green-400">Активна</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
