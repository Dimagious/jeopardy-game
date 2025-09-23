/**
 * Rate Limiter для защиты от спама и злоупотреблений
 * Используется в Buzzer Mode для ограничения частоты buzz событий
 */

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  blockDurationMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked: boolean
}

export interface PlayerRateLimit {
  playerId: string
  requests: number[]
  blockedUntil: number | null
  totalRequests: number
}

export class RateLimiter {
  private players: Map<string, PlayerRateLimit> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = {
    maxRequests: 1, // Максимум 1 buzz в секунду
    windowMs: 1000, // Окно в 1 секунду
    blockDurationMs: 5000 // Блокировка на 5 секунд при превышении
  }) {
    this.config = config
  }

  /**
   * Проверяет, разрешен ли запрос для игрока
   */
  checkLimit(playerId: string): RateLimitResult {
    const now = Date.now()
    const player = this.getOrCreatePlayer(playerId)
    
    // Очищаем старые запросы
    this.cleanupOldRequests(player, now)
    
    // Снимаем блокировку если время истекло
    if (player.blockedUntil && now >= player.blockedUntil) {
      player.blockedUntil = null
    }
    
    // Проверяем, заблокирован ли игрок
    if (player.blockedUntil && now < player.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: player.blockedUntil,
        blocked: true
      }
    }
    
    // Проверяем лимит запросов
    const recentRequests = player.requests.filter(
      time => now - time < this.config.windowMs
    )
    
    if (recentRequests.length >= this.config.maxRequests) {
      // Превышен лимит - блокируем игрока
      player.blockedUntil = now + this.config.blockDurationMs
      return {
        allowed: false,
        remaining: 0,
        resetTime: player.blockedUntil,
        blocked: true
      }
    }
    
    // Запрос разрешен
    player.requests.push(now)
    player.totalRequests++
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - recentRequests.length - 1,
      resetTime: now + this.config.windowMs,
      blocked: false
    }
  }

  /**
   * Принудительно блокирует игрока
   */
  blockPlayer(playerId: string, durationMs: number = this.config.blockDurationMs): void {
    const player = this.getOrCreatePlayer(playerId)
    player.blockedUntil = Date.now() + durationMs
  }

  /**
   * Разблокирует игрока
   */
  unblockPlayer(playerId: string): void {
    const player = this.players.get(playerId)
    if (player) {
      player.blockedUntil = null
    }
  }

  /**
   * Получает статистику для игрока
   */
  getPlayerStats(playerId: string): PlayerRateLimit | null {
    return this.players.get(playerId) || null
  }

  /**
   * Очищает старые записи
   */
  cleanup(): void {
    const now = Date.now()
    const maxAge = this.config.windowMs * 2 // Храним данные в 2 раза дольше окна
    
    for (const [playerId, player] of this.players.entries()) {
      // Удаляем старые запросы
      player.requests = player.requests.filter(time => now - time < maxAge)
      
      // Удаляем игроков без активности
      if (player.requests.length === 0 && !player.blockedUntil) {
        this.players.delete(playerId)
      }
    }
  }

  /**
   * Получает всех активных игроков
   */
  getActivePlayers(): string[] {
    const now = Date.now()
    return Array.from(this.players.keys()).filter(playerId => {
      const player = this.players.get(playerId)!
      return player.requests.length > 0 || 
             (player.blockedUntil && now < player.blockedUntil)
    })
  }

  /**
   * Сбрасывает все лимиты
   */
  reset(): void {
    this.players.clear()
  }

  private getOrCreatePlayer(playerId: string): PlayerRateLimit {
    if (!this.players.has(playerId)) {
      this.players.set(playerId, {
        playerId,
        requests: [],
        blockedUntil: null,
        totalRequests: 0
      })
    }
    return this.players.get(playerId)!
  }

  private cleanupOldRequests(player: PlayerRateLimit, now: number): void {
    player.requests = player.requests.filter(
      time => now - time < this.config.windowMs
    )
  }
}

/**
 * Debounce утилита для предотвращения множественных нажатий
 */
export class Debouncer {
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private delay: number

  constructor(delay: number = 300) {
    this.delay = delay
  }

  /**
   * Выполняет функцию с задержкой, отменяя предыдущие вызовы
   */
  debounce<T extends (...args: unknown[]) => void>(
    key: string,
    fn: T,
    ...args: Parameters<T>
  ): void {
    // Отменяем предыдущий вызов
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Устанавливаем новый таймаут
    const timeout = setTimeout(() => {
      fn(...args)
      this.timeouts.delete(key)
    }, this.delay)

    this.timeouts.set(key, timeout)
  }

  /**
   * Отменяет debounce для ключа
   */
  cancel(key: string): void {
    const timeout = this.timeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(key)
    }
  }

  /**
   * Очищает все таймауты
   */
  clear(): void {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()
  }
}

/**
 * Throttle утилита для ограничения частоты вызовов
 */
export class Throttler {
  private lastCall: Map<string, number> = new Map()
  private delay: number

  constructor(delay: number = 1000) {
    this.delay = delay
  }

  /**
   * Выполняет функцию только если прошло достаточно времени
   */
  throttle<T extends (...args: unknown[]) => void>(
    key: string,
    fn: T,
    ...args: Parameters<T>
  ): boolean {
    const now = Date.now()
    const lastCallTime = this.lastCall.get(key) || 0

    if (now - lastCallTime >= this.delay) {
      this.lastCall.set(key, now)
      fn(...args)
      return true
    }

    return false
  }

  /**
   * Сбрасывает throttle для ключа
   */
  reset(key: string): void {
    this.lastCall.delete(key)
  }

  /**
   * Очищает все throttle
   */
  clear(): void {
    this.lastCall.clear()
  }
}

// Глобальные экземпляры
export const buzzRateLimiter = new RateLimiter({
  maxRequests: 1,
  windowMs: 1000,
  blockDurationMs: 5000
})

export const buzzDebouncer = new Debouncer(300)
export const buzzThrottler = new Throttler(1000)
