import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useSessionStore, sessionUtils } from '../shared/sessionStore'
import { analytics } from '../shared/analytics'

export default function PinRedirectPage() {
  const { pin } = useParams<{ pin: string }>()
  const navigate = useNavigate()
  const { getSessionByPin } = useSessionStore()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pin) {
      analytics.pinPageView(pin)
      
      // Валидация PIN
      if (!sessionUtils.isValidPin(pin)) {
        setError('Неверный формат PIN. PIN должен содержать 6 цифр.')
        return
      }

      // Поиск сессии по PIN
      const session = getSessionByPin(pin)
      
      if (!session) {
        setError('Сессия с таким PIN не найдена или была завершена.')
        return
      }

      if (!session.isActive) {
        setError('Сессия была завершена ведущим.')
        return
      }

      // Редирект на страницу игрока
      setIsRedirecting(true)
      setTimeout(() => {
        navigate(`/player/${session.id}`, { replace: true })
      }, 1000)
    }
  }, [pin, navigate, getSessionByPin])

  if (error) {
    return (
      <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Ошибка подключения</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">{error}</p>
            <div className="text-sm text-gray-400">
              <p>PIN: <span className="font-mono font-bold">{pin}</span></p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-jeopardy-gold hover:bg-jeopardy-gold/90 text-jeopardy-dark font-semibold rounded-md transition-colors"
            >
              Вернуться на главную
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-jeopardy-gold">Подключение...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-jeopardy-gold border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-300">Находим сессию с PIN: <span className="font-mono font-bold text-jeopardy-gold">{pin}</span></p>
            <p className="text-sm text-gray-400">Перенаправляем вас...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-jeopardy-dark text-white flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="text-center text-jeopardy-gold">Проверка PIN</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-jeopardy-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Проверяем PIN...</p>
        </CardContent>
      </Card>
    </div>
  )
}
