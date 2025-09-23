import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'
import { analytics } from '../shared/analytics'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Track login event
    analytics.login()
    
    // TODO: Implement Supabase auth
    // For now, just navigate to a demo game
    setTimeout(() => {
      navigate('/host/demo-game')
    }, 1000)
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
              />
            </div>
            
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Демо-режим: нажмите "Войти" для перехода к тестовой игре
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
