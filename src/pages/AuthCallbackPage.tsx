import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../shared/supabaseClient'
import { analytics } from '../shared/analytics'

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Ошибка при входе в систему')
          return
        }

        if (data.session?.user) {
          // Track successful login
          analytics.login()
          
          // Redirect to admin dashboard
          navigate('/admin')
        } else {
          setError('Сессия не найдена')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Произошла ошибка при обработке входа')
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jeopardy-blue to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Обработка входа...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jeopardy-blue to-purple-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-jeopardy-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    )
  }

  return null
}
