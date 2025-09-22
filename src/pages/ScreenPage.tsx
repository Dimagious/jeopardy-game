import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Screen } from '../components'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function ScreenPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { initializeGame, hasActiveGame } = useGameStore()

  useEffect(() => {
    if (gameId) {
      analytics.screenPageView(gameId)
      
      // Если есть активная игра, не переинициализируем
      if (!hasActiveGame()) {
        initializeGame(gameId)
      }
    }
  }, [gameId, initializeGame, hasActiveGame])

  return <Screen />
}
