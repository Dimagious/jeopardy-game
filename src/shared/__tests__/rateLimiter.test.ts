import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter, Debouncer, Throttler } from '../rateLimiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      blockDurationMs: 2000
    })
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.checkLimit('player1')
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(1)

      const result2 = rateLimiter.checkLimit('player1')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(0)
    })

    it('should block requests when limit exceeded', () => {
      // Исчерпываем лимит
      rateLimiter.checkLimit('player1')
      rateLimiter.checkLimit('player1')
      
      const result = rateLimiter.checkLimit('player1')
      expect(result.allowed).toBe(false)
      expect(result.blocked).toBe(true)
    })

    it('should reset after window expires', async () => {
      // Исчерпываем лимит
      rateLimiter.checkLimit('player1')
      rateLimiter.checkLimit('player1')
      
      // Ждем истечения окна
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const result = rateLimiter.checkLimit('player1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })

    it('should handle different players independently', () => {
      const result1 = rateLimiter.checkLimit('player1')
      const result2 = rateLimiter.checkLimit('player2')
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
    })
  })

  describe('blockPlayer', () => {
    it('should block player for specified duration', () => {
      rateLimiter.blockPlayer('player1', 1000)
      
      const result = rateLimiter.checkLimit('player1')
      expect(result.allowed).toBe(false)
      expect(result.blocked).toBe(true)
    })

    it('should unblock player after duration', async () => {
      rateLimiter.blockPlayer('player1', 100)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const result = rateLimiter.checkLimit('player1')
      expect(result.allowed).toBe(true)
    })
  })

  describe('getPlayerStats', () => {
    it('should return player statistics', () => {
      rateLimiter.checkLimit('player1')
      rateLimiter.checkLimit('player1')
      
      const stats = rateLimiter.getPlayerStats('player1')
      expect(stats).toBeDefined()
      expect(stats?.totalRequests).toBe(2)
      expect(stats?.requests.length).toBe(2)
    })
  })

  describe('cleanup', () => {
    it('should remove old entries', () => {
      rateLimiter.checkLimit('player1')
      
      // Ждем истечения окна
      setTimeout(() => {
        rateLimiter.cleanup()
        
        const stats = rateLimiter.getPlayerStats('player1')
        expect(stats).toBeNull()
      }, 1100)
    })
  })
})

describe('Debouncer', () => {
  let debouncer: Debouncer

  beforeEach(() => {
    debouncer = new Debouncer(100)
  })

  it('should debounce function calls', async () => {
    const mockFn = vi.fn()
    
    debouncer.debounce('key1', mockFn)
    debouncer.debounce('key1', mockFn)
    debouncer.debounce('key1', mockFn)
    
    // Функция не должна быть вызвана сразу
    expect(mockFn).not.toHaveBeenCalled()
    
    // Ждем debounce delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Функция должна быть вызвана только один раз
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle different keys independently', async () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    
    debouncer.debounce('key1', mockFn1)
    debouncer.debounce('key2', mockFn2)
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(1)
  })

  it('should cancel debounced calls', () => {
    const mockFn = vi.fn()
    
    debouncer.debounce('key1', mockFn)
    debouncer.cancel('key1')
    
    // Ждем больше чем debounce delay
    setTimeout(() => {
      expect(mockFn).not.toHaveBeenCalled()
    }, 150)
  })
})

describe('Throttler', () => {
  let throttler: Throttler

  beforeEach(() => {
    throttler = new Throttler(100)
  })

  it('should throttle function calls', () => {
    const mockFn = vi.fn()
    
    const result1 = throttler.throttle('key1', mockFn)
    const result2 = throttler.throttle('key1', mockFn)
    
    expect(result1).toBe(true)
    expect(result2).toBe(false)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should allow calls after throttle period', async () => {
    const mockFn = vi.fn()
    
    throttler.throttle('key1', mockFn)
    
    // Ждем throttle period
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const result = throttler.throttle('key1', mockFn)
    expect(result).toBe(true)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should handle different keys independently', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    
    const result1 = throttler.throttle('key1', mockFn1)
    const result2 = throttler.throttle('key2', mockFn2)
    
    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(1)
  })
})
