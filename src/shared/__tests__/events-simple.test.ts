import { describe, it, expect } from 'vitest'
import {
  createGameEvent,
  isGameEvent,
  isBoardSelectEvent,
  isAnswerToggleEvent,
  isJudgeEvent,
  isLockEvent,
  isBuzzEvent,
  isAnswerSubmitEvent,
} from '../events'

describe('Game Events - Simple Tests', () => {
  const mockGameId = 'test-game-id'
  const mockQuestionId = 'test-question-id'
  const mockCategoryId = 'test-category-id'
  const mockTeamId = 'test-team-id'
  const mockPlayerId = 'test-player-id'
  const mockSessionId = 'test-session-id'

  describe('createGameEvent', () => {
    it('should create BoardSelectEvent with correct structure', () => {
      const event = createGameEvent.boardSelect(mockGameId, mockQuestionId, mockCategoryId, 200)
      
      expect(event.type).toBe('BOARD_SELECT')
      expect(event.gameId).toBe(mockGameId)
      expect(event.questionId).toBe(mockQuestionId)
      expect(event.categoryId).toBe(mockCategoryId)
      expect(event.value).toBe(200)
      expect(typeof event.timestamp).toBe('number')
    })

    it('should create AnswerToggleEvent with correct structure', () => {
      const event = createGameEvent.answerToggle(mockGameId, mockQuestionId, true)
      
      expect(event.type).toBe('ANSWER_TOGGLE')
      expect(event.gameId).toBe(mockGameId)
      expect(event.questionId).toBe(mockQuestionId)
      expect(event.show).toBe(true)
      expect(typeof event.timestamp).toBe('number')
    })

    it('should create JudgeEvent with correct structure', () => {
      const event = createGameEvent.judge(mockGameId, mockQuestionId, mockTeamId, true, 300)
      
      expect(event.type).toBe('JUDGE')
      expect(event.gameId).toBe(mockGameId)
      expect(event.questionId).toBe(mockQuestionId)
      expect(event.teamId).toBe(mockTeamId)
      expect(event.correct).toBe(true)
      expect(event.delta).toBe(300)
      expect(typeof event.timestamp).toBe('number')
    })

    it('should create LockEvent with correct structure', () => {
      const event = createGameEvent.lock(mockGameId, mockQuestionId)
      
      expect(event.type).toBe('LOCK')
      expect(event.gameId).toBe(mockGameId)
      expect(event.questionId).toBe(mockQuestionId)
      expect(typeof event.timestamp).toBe('number')
    })

    it('should create BuzzEvent with correct structure', () => {
      const serverTimestamp = 1704067200000
      const event = createGameEvent.buzz(mockGameId, mockPlayerId, mockSessionId, serverTimestamp)
      
      expect(event.type).toBe('BUZZ')
      expect(event.gameId).toBe(mockGameId)
      expect(event.playerId).toBe(mockPlayerId)
      expect(event.sessionId).toBe(mockSessionId)
      expect(event.serverTimestamp).toBe(serverTimestamp)
      expect(typeof event.timestamp).toBe('number')
    })

    it('should create AnswerSubmitEvent with correct structure', () => {
      const payload = { text: 'Test answer' }
      const event = createGameEvent.answerSubmit(mockGameId, mockQuestionId, mockPlayerId, mockSessionId, payload)
      
      expect(event.type).toBe('ANSWER_SUBMIT')
      expect(event.gameId).toBe(mockGameId)
      expect(event.questionId).toBe(mockQuestionId)
      expect(event.playerId).toBe(mockPlayerId)
      expect(event.sessionId).toBe(mockSessionId)
      expect(event.payload).toEqual(payload)
      expect(typeof event.timestamp).toBe('number')
    })
  })

  describe('isGameEvent', () => {
    it('should return true for valid game event', () => {
      const event = createGameEvent.boardSelect(mockGameId, mockQuestionId, mockCategoryId, 100)
      expect(isGameEvent(event)).toBe(true)
    })

    it('should return false for invalid event', () => {
      expect(isGameEvent(null)).toBe(false)
      expect(isGameEvent(undefined)).toBe(false)
      expect(isGameEvent({})).toBe(false)
      expect(isGameEvent({ type: 'INVALID' })).toBe(false)
    })
  })

  describe('type guards', () => {
    const boardSelectEvent = createGameEvent.boardSelect(mockGameId, mockQuestionId, mockCategoryId, 100)
    const answerToggleEvent = createGameEvent.answerToggle(mockGameId, mockQuestionId, true)
    const judgeEvent = createGameEvent.judge(mockGameId, mockQuestionId, mockTeamId, true, 200)
    const lockEvent = createGameEvent.lock(mockGameId, mockQuestionId)
    const buzzEvent = createGameEvent.buzz(mockGameId, mockPlayerId, mockSessionId, 1704067200000)
    const answerSubmitEvent = createGameEvent.answerSubmit(mockGameId, mockQuestionId, mockPlayerId, mockSessionId, { text: 'test' })

    it('should correctly identify BoardSelectEvent', () => {
      expect(isBoardSelectEvent(boardSelectEvent)).toBe(true)
      expect(isBoardSelectEvent(answerToggleEvent)).toBe(false)
      expect(isBoardSelectEvent(judgeEvent)).toBe(false)
    })

    it('should correctly identify AnswerToggleEvent', () => {
      expect(isAnswerToggleEvent(answerToggleEvent)).toBe(true)
      expect(isAnswerToggleEvent(boardSelectEvent)).toBe(false)
      expect(isAnswerToggleEvent(judgeEvent)).toBe(false)
    })

    it('should correctly identify JudgeEvent', () => {
      expect(isJudgeEvent(judgeEvent)).toBe(true)
      expect(isJudgeEvent(boardSelectEvent)).toBe(false)
      expect(isJudgeEvent(answerToggleEvent)).toBe(false)
    })

    it('should correctly identify LockEvent', () => {
      expect(isLockEvent(lockEvent)).toBe(true)
      expect(isLockEvent(boardSelectEvent)).toBe(false)
      expect(isLockEvent(judgeEvent)).toBe(false)
    })

    it('should correctly identify BuzzEvent', () => {
      expect(isBuzzEvent(buzzEvent)).toBe(true)
      expect(isBuzzEvent(boardSelectEvent)).toBe(false)
      expect(isBuzzEvent(judgeEvent)).toBe(false)
    })

    it('should correctly identify AnswerSubmitEvent', () => {
      expect(isAnswerSubmitEvent(answerSubmitEvent)).toBe(true)
      expect(isAnswerSubmitEvent(boardSelectEvent)).toBe(false)
      expect(isAnswerSubmitEvent(judgeEvent)).toBe(false)
    })
  })
})
