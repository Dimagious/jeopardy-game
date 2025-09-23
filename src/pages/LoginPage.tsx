import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'
import { analytics } from '../shared/analytics'
import { useAuth } from '../shared/useAuthSimple'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signInWithEmail } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    
    try {
      // Track login event
      analytics.login()
      
      await signInWithEmail(email)
      setMessage('Проверьте вашу почту! Мы отправили ссылку для входа.')
    } catch (err) {
      console.error('Login error:', err)
      setError('Ошибка при отправке ссылки. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jeopardy-blue to-purple-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-display-3 text-white">Jeopardy Game</CardTitle>
          <CardDescription className="text-gray-300">
            Войдите, чтобы начать игру
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-300">{message}</p>
              </div>
            )}
            
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Отправка...' : 'Получить ссылку для входа'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Мы отправим ссылку для входа на ваш email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
