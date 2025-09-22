import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../gameStore'

describe('GameStore - Snapshot Functionality', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    useGameStore.getState().clearGame()
    vi.clearAllMocks()
    
    // Сбрасываем мок localStorage
    vi.mocked(localStorage.setItem).mockClear()
    vi.mocked(localStorage.getItem).mockClear()
  })

  describe('hasActiveGame', () => {
    it('should return false when no game is active', () => {
      const { hasActiveGame } = useGameStore.getState()
      expect(hasActiveGame()).toBe(false)
    })

    it('should return true when game is active', () => {
      const { initializeGame, hasActiveGame } = useGameStore.getState()
      initializeGame('demo-game')
      expect(hasActiveGame()).toBe(true)
    })
  })

  describe('getGameSnapshot', () => {
    it('should return complete game snapshot', () => {
      const { initializeGame, getGameSnapshot } = useGameStore.getState()
      initializeGame('demo-game')
      
      const snapshot = getGameSnapshot()
      
      expect(snapshot).toHaveProperty('game')
      expect(snapshot).toHaveProperty('categories')
      expect(snapshot).toHaveProperty('questions')
      expect(snapshot).toHaveProperty('teams')
      expect(snapshot).toHaveProperty('scoreEvents')
      expect(snapshot).toHaveProperty('gameState')
      expect(snapshot).toHaveProperty('lastSaved')
      expect(typeof snapshot.lastSaved).toBe('number')
    })

    it('should include current game state in snapshot', () => {
      const { initializeGame, selectQuestion, getGameSnapshot } = useGameStore.getState()
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      
      const snapshot = getGameSnapshot()
      
      expect(snapshot.gameState?.currentQuestion).toBeDefined()
      expect(snapshot.gameState?.currentQuestion?.id).toBe('q-1-1')
    })
  })

  describe('restoreGameSnapshot', () => {
    it('should restore complete game state', () => {
      const { initializeGame, selectQuestion, getGameSnapshot, restoreGameSnapshot, clearGame } = useGameStore.getState()
      
      // Создаем игру с состоянием
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      const snapshot = getGameSnapshot()
      
      // Очищаем и восстанавливаем
      clearGame()
      expect(useGameStore.getState().hasActiveGame()).toBe(false)
      
      restoreGameSnapshot(snapshot)
      expect(useGameStore.getState().hasActiveGame()).toBe(true)
      expect(useGameStore.getState().gameState?.currentQuestion?.id).toBe('q-1-1')
    })

    it('should restore score events', () => {
      const { initializeGame, selectQuestion, judgeAnswer, getGameSnapshot, restoreGameSnapshot, clearGame } = useGameStore.getState()
      
      // Создаем игру с очками
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      judgeAnswer('team-1', true)
      const snapshot = getGameSnapshot()
      
      // Очищаем и восстанавливаем
      clearGame()
      restoreGameSnapshot(snapshot)
      
      expect(useGameStore.getState().scoreEvents).toHaveLength(1)
      expect(useGameStore.getState().getTeamScore('team-1')).toBe(100)
    })
  })

  describe('clearGame', () => {
    it('should clear all game data', () => {
      const { initializeGame, selectQuestion, clearGame } = useGameStore.getState()
      
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      
      expect(useGameStore.getState().hasActiveGame()).toBe(true)
      
      clearGame()
      
      expect(useGameStore.getState().hasActiveGame()).toBe(false)
      expect(useGameStore.getState().game).toBeNull()
      expect(useGameStore.getState().categories).toHaveLength(0)
      expect(useGameStore.getState().questions).toHaveLength(0)
      expect(useGameStore.getState().teams).toHaveLength(0)
      expect(useGameStore.getState().scoreEvents).toHaveLength(0)
      expect(useGameStore.getState().gameState).toBeNull()
    })
  })

  describe('createAutoSnapshot', () => {
    it('should create snapshot when game is active', () => {
      const { initializeGame, selectQuestion, createAutoSnapshot } = useGameStore.getState()
      
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      
      createAutoSnapshot()
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'jeopardy-game-snapshot',
        expect.stringContaining('"game"')
      )
    })

    it('should not create snapshot when no game is active', () => {
      const { createAutoSnapshot } = useGameStore.getState()
      
      createAutoSnapshot()
      
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should include all game data in snapshot', () => {
      const { initializeGame, selectQuestion, judgeAnswer, createAutoSnapshot } = useGameStore.getState()
      
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      judgeAnswer('team-1', true)
      
      createAutoSnapshot()
      
      const snapshotCall = vi.mocked(localStorage.setItem).mock.calls.find(
        (call: [string, string]) => call[0] === 'jeopardy-game-snapshot'
      )
      
      expect(snapshotCall).toBeDefined()
      
      const snapshot = JSON.parse(snapshotCall![1])
      expect(snapshot).toHaveProperty('game')
      expect(snapshot).toHaveProperty('categories')
      expect(snapshot).toHaveProperty('questions')
      expect(snapshot).toHaveProperty('teams')
      expect(snapshot).toHaveProperty('scoreEvents')
      expect(snapshot).toHaveProperty('gameState')
      expect(snapshot).toHaveProperty('lastSaved')
    })
  })

  describe('Auto-snapshot integration', () => {
    it('should create snapshot after selectQuestion', () => {
      const { initializeGame, selectQuestion } = useGameStore.getState()
      
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'jeopardy-game-snapshot',
        expect.stringContaining('"game"')
      )
    })

    it('should create snapshot after judgeAnswer', () => {
      const { initializeGame, selectQuestion, judgeAnswer } = useGameStore.getState()
      
      initializeGame('demo-game')
      selectQuestion('q-1-1')
      vi.clearAllMocks()
      
      judgeAnswer('team-1', true)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'jeopardy-game-snapshot',
        expect.stringContaining('"game"')
      )
    })
  })
})
