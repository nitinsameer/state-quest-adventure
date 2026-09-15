import { describe, it, expect, beforeEach } from 'vitest'
import {
  questionsForState,
  questionsForStateName,
  randomQuestionsForState,
  questionCountForAgeBand,
  QUIZ_BY_STATE,
  type QuizQuestion,
} from '../quiz'
import { INDIA_STATES } from '../states'

describe('questionsForState - Quiz Question Generation (Bug #7)', () => {
  it('should generate exactly 10 questions per state', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)
    expect(questions.length).toBe(10)
  })

  it('should generate questions for all states', () => {
    INDIA_STATES.forEach(state => {
      const questions = questionsForState(state)
      expect(questions.length).toBe(10)
      questions.forEach(q => {
        expect(q).toHaveProperty('id')
        expect(q).toHaveProperty('prompt')
        expect(q).toHaveProperty('correct')
        expect(q).toHaveProperty('options')
      })
    })
  })

  it('should NOT generate blank questions', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      expect(q.prompt).toBeTruthy()
      expect(q.prompt.length).toBeGreaterThan(0)
      expect(q.correct).toBeTruthy()
      expect(q.correct.length).toBeGreaterThan(0)
      expect(q.options.length).toBeGreaterThan(0)
    })
  })

  it('should have at least 3 valid options per question', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should NOT have duplicate options in same question', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      const uniqueOptions = new Set(q.options)
      expect(uniqueOptions.size).toBe(q.options.length)
    })
  })

  it('should include correct answer in options', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      expect(q.options).toContain(q.correct)
    })
  })

  it('should assign XP to questions', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      expect(q.xp).toBeGreaterThan(0)
    })
  })

  it('should generate unique question IDs', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    const ids = new Set(questions.map(q => q.id))
    expect(ids.size).toBe(questions.length) // All unique
  })

  it('should generate deterministic output (same state = same questions)', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const q1 = questionsForState(rajasthan)
    const q2 = questionsForState(rajasthan)

    expect(q1).toEqual(q2) // Exact same structure
  })

  it('should handle state with potential missing data gracefully', () => {
    // Test with first state (which should exist)
    const state = INDIA_STATES[0]
    expect(() => questionsForState(state)).not.toThrow()

    const questions = questionsForState(state)
    expect(questions.length).toBe(10)
    questions.forEach(q => {
      expect(q.prompt).not.toContain('[object Object]')
      expect(q.correct).not.toContain('[object Object]')
    })
  })

  it('BUG #7: should NOT return blank answers if data missing', () => {
    // Even if state data is incomplete, questions should have fallback values
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    questions.forEach(q => {
      // No question should have empty correct answer
      expect(q.correct).not.toBe('')
      expect(q.correct).not.toBe('[MISSING DATA]')
    })
  })

  it('should contain variety of question types', () => {
    const rajasthan = INDIA_STATES.find(s => s.name === 'Rajasthan')!
    const questions = questionsForState(rajasthan)

    const kickers = new Set(questions.map(q => q.kicker))
    expect(kickers.size).toBeGreaterThan(1) // Multiple question types
    expect(kickers).toContain('Capital City')
    expect(kickers).toContain('Language')
  })
})

describe('randomQuestionsForState - Question Shuffling', () => {
  it('should return exactly count questions', () => {
    const questions = randomQuestionsForState('Rajasthan', 3)
    expect(questions.length).toBe(3)
  })

  it('should return all 10 questions if count >= pool size', () => {
    const questions = randomQuestionsForState('Rajasthan', 10)
    expect(questions.length).toBe(10)
  })

  it('should return fewer questions if count > available', () => {
    const questions = randomQuestionsForState('Rajasthan', 20)
    expect(questions.length).toBeLessThanOrEqual(10)
  })

  it('should shuffle questions in different order (probabilistic)', () => {
    const runs = []
    for (let i = 0; i < 5; i++) {
      const questions = randomQuestionsForState('Rajasthan', 10)
      runs.push(questions.map(q => q.id).join(','))
    }

    // At least one should be different from the first
    const allSame = runs.every(r => r === runs[0])
    expect(allSame).toBe(false) // Should have variation
  })

  it('should not modify original questions', () => {
    const original = questionsForStateName('Rajasthan')
    const originalIds = original.map(q => q.id)

    randomQuestionsForState('Rajasthan', 5)

    const afterIds = questionsForStateName('Rajasthan').map(q => q.id)
    expect(originalIds).toEqual(afterIds) // Original unchanged
  })

  it('should handle count = 0', () => {
    const questions = randomQuestionsForState('Rajasthan', 0)
    expect(questions.length).toBe(0)
  })

  it('should handle default count (3)', () => {
    const questions = randomQuestionsForState('Rajasthan')
    expect(questions.length).toBe(3)
  })

  it('should return valid questions after shuffle', () => {
    const questions = randomQuestionsForState('Rajasthan', 5)

    questions.forEach(q => {
      expect(q.prompt).toBeTruthy()
      expect(q.correct).toBeTruthy()
      expect(q.options).toContain(q.correct)
    })
  })
})

describe('questionsForStateName - State Name Lookup', () => {
  it('should find questions by valid state name', () => {
    const questions = questionsForStateName('Rajasthan')
    expect(questions.length).toBe(10)
  })

  it('should find questions for all states', () => {
    INDIA_STATES.forEach(state => {
      const questions = questionsForStateName(state.name)
      expect(questions.length).toBe(10)
    })
  })

  it('should fall back to first state for invalid name', () => {
    const questions = questionsForStateName('InvalidState')
    expect(questions).toBeDefined()
    expect(questions.length).toBe(10)
  })

  it('should handle empty string state name', () => {
    const questions = questionsForStateName('')
    expect(questions).toBeDefined()
  })

  it('should be case-sensitive for state names', () => {
    const validQuestions = questionsForStateName('Rajasthan')
    const invalidQuestions = questionsForStateName('rajasthan')

    // If case-sensitive, should fall back to first state
    // Both should be defined but possibly different
    expect(validQuestions).toBeDefined()
    expect(invalidQuestions).toBeDefined()
  })
})

describe('questionCountForAgeBand - Age-Based Question Count (Bug #4 related)', () => {
  it('should return 3 questions for 3-5 age band', () => {
    const count = questionCountForAgeBand('3-5')
    expect(count).toBe(3)
  })

  it('should return 5 questions for 6-7 age band', () => {
    const count = questionCountForAgeBand('6-7')
    expect(count).toBe(5)
  })

  it('should return 7 questions for 8-9 age band', () => {
    const count = questionCountForAgeBand('8-9')
    expect(count).toBe(7)
  })

  it('should return 10 questions for 10-12 age band', () => {
    const count = questionCountForAgeBand('10-12')
    expect(count).toBe(10)
  })

  it('should return 10 questions for unknown age band', () => {
    const count = questionCountForAgeBand('99-100')
    expect(count).toBe(10)
  })

  it('should return 10 questions for empty string', () => {
    const count = questionCountForAgeBand('')
    expect(count).toBe(10)
  })

  it('should default to 8-9 (7 questions) for undefined', () => {
    const count = questionCountForAgeBand()
    // The default param is '8-9', which returns 7
    expect(count).toBe(7)
  })

  it('should return valid counts for all defined age bands', () => {
    const counts = {
      '3-5': 3,
      '6-7': 5,
      '8-9': 7,
      '10-12': 10,
    }

    Object.entries(counts).forEach(([band, expectedCount]) => {
      expect(questionCountForAgeBand(band)).toBe(expectedCount)
    })
  })

  it('should progressively increase question count with age', () => {
    const count3_5 = questionCountForAgeBand('3-5')
    const count6_7 = questionCountForAgeBand('6-7')
    const count8_9 = questionCountForAgeBand('8-9')
    const count10_12 = questionCountForAgeBand('10-12')

    expect(count3_5).toBeLessThan(count6_7)
    expect(count6_7).toBeLessThan(count8_9)
    expect(count8_9).toBeLessThan(count10_12)
  })
})

describe('QUIZ_BY_STATE - Quiz Cache', () => {
  it('should have entries for all states', () => {
    expect(Object.keys(QUIZ_BY_STATE).length).toBe(INDIA_STATES.length)
  })

  it('should have 10 questions per state', () => {
    Object.values(QUIZ_BY_STATE).forEach(questions => {
      expect(questions.length).toBe(10)
    })
  })

  it('should return same cached questions on access', () => {
    const q1 = QUIZ_BY_STATE['Rajasthan']
    const q2 = QUIZ_BY_STATE['Rajasthan']
    expect(q1).toBe(q2) // Same reference
  })

  it('should have valid questions in cache', () => {
    Object.entries(QUIZ_BY_STATE).forEach(([stateName, questions]) => {
      questions.forEach(q => {
        expect(q.prompt).toBeTruthy()
        expect(q.correct).toBeTruthy()
        expect(q.options.length).toBeGreaterThan(0)
      })
    })
  })
})
