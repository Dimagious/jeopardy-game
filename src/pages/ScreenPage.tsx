import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Screen } from '../components'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function ScreenPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { initializeGame, hasActiveGame } = useGameStore()
  const [, forceUpdate] = useState({})

  useEffect(() => {
    if (gameId) {
      analytics.screenPageView(gameId)
      
      // Если есть активная игра, не переинициализируем
      if (!hasActiveGame()) {
        initializeGame(gameId)
      }
    }
  }, [gameId, initializeGame, hasActiveGame])

  // Принудительная подписка на изменения store
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(() => {
      forceUpdate({})
    })

    return unsubscribe
  }, [])

  // Простая и надежная синхронизация
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jeopardy-game-store') {
        // Принудительно перезагружаем store из localStorage
        try {
          const storedData = localStorage.getItem('jeopardy-game-store')
          if (storedData) {
            const parsed = JSON.parse(storedData)
            
            // Принудительно обновляем store
            useGameStore.setState({
              game: parsed.state.game,
              categories: parsed.state.categories,
              questions: parsed.state.questions,
              teams: parsed.state.teams,
              scoreEvents: parsed.state.scoreEvents,
              gameState: parsed.state.gameState,
            })
          }
        } catch (error) {
          console.error('Error parsing store data', error)
        }
        
        forceUpdate({})
      }
    }

    // Слушаем изменения localStorage
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return <Screen />
}
