import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ReconnectManager, NetworkMonitor } from '../reconnectManager'

describe('ReconnectManager', () => {
  let reconnectManager: ReconnectManager
  let mockReconnectCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    reconnectManager = new ReconnectManager({
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      timeoutMs: 500
    })
    
    mockReconnectCallback = vi.fn()
    reconnectManager.setReconnectCallback(mockReconnectCallback)
  })

  describe('setReconnectCallback', () => {
    it('should set reconnect callback', () => {
      const callback = vi.fn()
      reconnectManager.setReconnectCallback(callback)
      expect(reconnectManager.getState().sessionId).toBeNull()
    })
  })

  describe('onConnectionChange', () => {
    it('should add connection change callback', () => {
      const callback = vi.fn()
      const unsubscribe = reconnectManager.onConnectionChange(callback)
      
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call connection callbacks on state change', () => {
      const callback = vi.fn()
      reconnectManager.onConnectionChange(callback)
      
      reconnectManager.handleDisconnection()
      expect(callback).toHaveBeenCalledWith(false)
      
      reconnectManager.handleReconnection()
      expect(callback).toHaveBeenCalledWith(true)
    })
  })

  describe('setSession', () => {
    it('should set session and player IDs', () => {
      reconnectManager.setSession('session1', 'player1')
      const state = reconnectManager.getState()
      
      expect(state.sessionId).toBe('session1')
      expect(state.playerId).toBe('player1')
    })
  })

  describe('handleDisconnection', () => {
    it('should start reconnect process', () => {
      reconnectManager.handleDisconnection()
      
      const state = reconnectManager.getState()
      expect(state.isConnected).toBe(false)
      expect(reconnectManager.isReconnecting()).toBe(true)
    })

    it('should not start reconnect if already disconnected', () => {
      reconnectManager.handleDisconnection()
      const firstState = reconnectManager.getState()
      
      reconnectManager.handleDisconnection()
      const secondState = reconnectManager.getState()
      
      expect(firstState.retryCount).toBe(secondState.retryCount)
    })
  })

  describe('handleReconnection', () => {
    it('should stop reconnect process', () => {
      reconnectManager.handleDisconnection()
      expect(reconnectManager.isReconnecting()).toBe(true)
      
      reconnectManager.handleReconnection()
      expect(reconnectManager.isReconnecting()).toBe(false)
      
      const state = reconnectManager.getState()
      expect(state.isConnected).toBe(true)
      expect(state.retryCount).toBe(0)
    })
  })

  describe('forceReconnect', () => {
    it('should reset retry count and start reconnect', () => {
      reconnectManager.handleDisconnection()
      reconnectManager.stopReconnect()
      
      reconnectManager.forceReconnect()
      expect(reconnectManager.isReconnecting()).toBe(true)
    })
  })

  describe('stopReconnect', () => {
    it('should stop reconnect process', () => {
      reconnectManager.handleDisconnection()
      expect(reconnectManager.isReconnecting()).toBe(true)
      
      reconnectManager.stopReconnect()
      expect(reconnectManager.isReconnecting()).toBe(false)
    })
  })

  describe('getState', () => {
    it('should return current state', () => {
      const state = reconnectManager.getState()
      
      expect(state).toHaveProperty('isConnected')
      expect(state).toHaveProperty('retryCount')
      expect(state).toHaveProperty('lastAttempt')
      expect(state).toHaveProperty('nextRetry')
      expect(state).toHaveProperty('sessionId')
      expect(state).toHaveProperty('playerId')
    })
  })

  describe('isReconnecting', () => {
    it('should return false when connected', () => {
      expect(reconnectManager.isReconnecting()).toBe(false)
    })

    it('should return true when reconnecting', () => {
      reconnectManager.handleDisconnection()
      expect(reconnectManager.isReconnecting()).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all state', () => {
      reconnectManager.setSession('session1', 'player1')
      reconnectManager.handleDisconnection()
      
      reconnectManager.reset()
      
      const state = reconnectManager.getState()
      expect(state.isConnected).toBe(true)
      expect(state.retryCount).toBe(0)
      expect(state.sessionId).toBeNull()
      expect(state.playerId).toBeNull()
    })
  })

  describe('reconnect process', () => {
    it('should call reconnect callback on disconnection', async () => {
      mockReconnectCallback.mockResolvedValue(true)
      
      reconnectManager.handleDisconnection()
      
      // Ждем выполнения reconnect
      await new Promise(resolve => setTimeout(resolve, 200))
      
      expect(mockReconnectCallback).toHaveBeenCalled()
    })

    it('should stop after max retries', async () => {
      mockReconnectCallback.mockResolvedValue(false)
      
      reconnectManager.handleDisconnection()
      
      // Ждем выполнения всех попыток
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      expect(mockReconnectCallback).toHaveBeenCalledTimes(3) // maxRetries
      expect(reconnectManager.isReconnecting()).toBe(false)
    })

    it('should use exponential backoff', async () => {
      mockReconnectCallback.mockResolvedValue(false)
      
      reconnectManager.handleDisconnection()
      
      // Ждем первой попытки
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const state = reconnectManager.getState()
      expect(state.retryCount).toBe(1)
    })
  })
})

describe('NetworkMonitor', () => {
  let reconnectManager: ReconnectManager
  let networkMonitor: NetworkMonitor

  beforeEach(() => {
    reconnectManager = new ReconnectManager()
    networkMonitor = new NetworkMonitor(reconnectManager)
  })

  describe('isBrowserOnline', () => {
    it('should return browser online status', () => {
      const isOnline = networkMonitor.isBrowserOnline()
      expect(typeof isOnline).toBe('boolean')
    })
  })

  describe('checkConnection', () => {
    it('should check connection status', async () => {
      // Мокаем fetch для тестирования
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })
      
      const isConnected = await networkMonitor.checkConnection()
      expect(isConnected).toBe(true)
    })

    it('should return false on connection error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      const isConnected = await networkMonitor.checkConnection()
      expect(isConnected).toBe(false)
    })
  })
})
