/**
 * Reconnect Manager для автоматического восстановления подключений
 * Обеспечивает стабильную работу при потере соединения
 */

export interface ReconnectConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  timeoutMs: number
}

export interface ReconnectState {
  isConnected: boolean
  retryCount: number
  lastAttempt: number
  nextRetry: number
  sessionId: string | null
  playerId: string | null
}

export type ReconnectCallback = () => Promise<boolean>
export type ConnectionCallback = (connected: boolean) => void

export class ReconnectManager {
  private config: ReconnectConfig
  private state: ReconnectState
  private retryTimeout: NodeJS.Timeout | null = null
  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private reconnectCallback: ReconnectCallback | null = null

  constructor(config: ReconnectConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    timeoutMs: 10000
  }) {
    this.config = config
    this.state = {
      isConnected: true,
      retryCount: 0,
      lastAttempt: 0,
      nextRetry: 0,
      sessionId: null,
      playerId: null
    }
  }

  /**
   * Устанавливает callback для переподключения
   */
  setReconnectCallback(callback: ReconnectCallback): void {
    this.reconnectCallback = callback
  }

  /**
   * Добавляет callback для уведомления об изменении соединения
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback)
    return () => this.connectionCallbacks.delete(callback)
  }

  /**
   * Устанавливает активную сессию и игрока
   */
  setSession(sessionId: string, playerId: string): void {
    this.state.sessionId = sessionId
    this.state.playerId = playerId
  }

  /**
   * Обрабатывает потерю соединения
   */
  handleDisconnection(): void {
    if (this.state.isConnected) {
      this.state.isConnected = false
      this.notifyConnectionChange(false)
      this.startReconnect()
    }
  }

  /**
   * Обрабатывает восстановление соединения
   */
  handleReconnection(): void {
    if (!this.state.isConnected) {
      this.state.isConnected = true
      this.state.retryCount = 0
      this.state.nextRetry = 0
      this.clearRetryTimeout()
      this.notifyConnectionChange(true)
    }
  }

  /**
   * Принудительно запускает переподключение
   */
  forceReconnect(): void {
    this.state.retryCount = 0
    this.startReconnect()
  }

  /**
   * Останавливает попытки переподключения
   */
  stopReconnect(): void {
    this.clearRetryTimeout()
    this.state.retryCount = 0
    this.state.nextRetry = 0
  }

  /**
   * Получает текущее состояние
   */
  getState(): ReconnectState {
    return { ...this.state }
  }

  /**
   * Проверяет, активно ли переподключение
   */
  isReconnecting(): boolean {
    return !this.state.isConnected && this.retryTimeout !== null
  }

  /**
   * Очищает состояние
   */
  reset(): void {
    this.stopReconnect()
    this.state = {
      isConnected: true,
      retryCount: 0,
      lastAttempt: 0,
      nextRetry: 0,
      sessionId: null,
      playerId: null
    }
    this.connectionCallbacks.clear()
    this.reconnectCallback = null
  }

  private startReconnect(): void {
    if (this.state.retryCount >= this.config.maxRetries) {
      console.warn('Max reconnect attempts reached')
      return
    }

    if (!this.reconnectCallback) {
      console.warn('No reconnect callback set')
      return
    }

    const delay = this.calculateDelay()
    this.state.nextRetry = Date.now() + delay

    this.retryTimeout = setTimeout(async () => {
      await this.attemptReconnect()
    }, delay)
  }

  private async attemptReconnect(): Promise<void> {
    if (!this.reconnectCallback) return

    this.state.lastAttempt = Date.now()
    this.state.retryCount++

    try {
      const success = await Promise.race([
        this.reconnectCallback(),
        this.createTimeoutPromise()
      ])

      if (success) {
        this.handleReconnection()
      } else {
        this.handleReconnectFailure()
      }
    } catch (error) {
      console.error('Reconnect attempt failed:', error)
      this.handleReconnectFailure()
    }
  }

  private handleReconnectFailure(): void {
    if (this.state.retryCount < this.config.maxRetries) {
      this.startReconnect()
    } else {
      console.error('Reconnect failed after max retries')
      this.stopReconnect()
    }
  }

  private calculateDelay(): number {
    const exponentialDelay = this.config.baseDelay * 
      Math.pow(this.config.backoffMultiplier, this.state.retryCount)
    
    return Math.min(exponentialDelay, this.config.maxDelay)
  }

  private createTimeoutPromise(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), this.config.timeoutMs)
    })
  }

  private clearRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected)
      } catch (error) {
        console.error('Error in connection callback:', error)
      }
    })
  }
}

/**
 * Network Monitor для отслеживания состояния сети
 */
export class NetworkMonitor {
  private reconnectManager: ReconnectManager
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true

  constructor(reconnectManager: ReconnectManager) {
    this.reconnectManager = reconnectManager
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') return

    // Отслеживаем изменения онлайн статуса
    window.addEventListener('online', () => {
      this.isOnline = true
      this.reconnectManager.handleReconnection()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.reconnectManager.handleDisconnection()
    })

    // Отслеживаем видимость страницы
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isOnline) {
        // Страница стала видимой, но мы офлайн - попробуем переподключиться
        this.reconnectManager.forceReconnect()
      }
    })
  }

  /**
   * Проверяет, онлайн ли браузер
   */
  isBrowserOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  /**
   * Принудительно проверяет соединение
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Простая проверка соединения
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Глобальный экземпляр
export const globalReconnectManager = new ReconnectManager()
export const networkMonitor = new NetworkMonitor(globalReconnectManager)
