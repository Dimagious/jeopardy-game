import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Screen } from '../components'
import { useGameStore } from '../shared/gameStore'
import { analytics } from '../shared/analytics'

export default function ScreenPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { initializeGame } = useGameStore()

  useEffect(() => {
    if (gameId) {
      analytics.screenPageView(gameId)
      initializeGame(gameId)
    }
  }, [gameId, initializeGame])

  return <Screen />
}
