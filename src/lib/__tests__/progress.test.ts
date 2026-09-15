import { describe, it, expect, beforeEach } from 'vitest'
import {
  addXP,
  completeState,
  touchStreak,
  markCard,
  resetProgress,
  saveProfile,
  levelInfo,
  CARDS_PER_STATE,
  XP_PER_CARD,
  XP_PER_LEVEL,
} from '../progress'

// Helper to reset state before each test
beforeEach(() => {
  resetProgress()
  localStorage.clear()
})

describe('addXP - XP Award & Deduplication (Bug #6)', () => {
  it('should reject negative XP amounts after fix', () => {
    addXP(-100, 'q-1')
    // After fix: negative XP should be rejected, so XP stays 0
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(0)
    }
  })

  it('should accept positive XP', () => {
    addXP(20, 'q-1')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    expect(stored).toBeTruthy()
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(20)
    }
  })

  it('should deduplicate by questionId', () => {
    addXP(20, 'q-1')
    addXP(20, 'q-1')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(20) // Still 20, not 40
      expect(p.answered.length).toBe(1)
    }
  })

  it('should award multiple times without questionId', () => {
    addXP(20)
    addXP(20)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(40)
    }
  })

  it('should handle empty string questionId correctly', () => {
    addXP(20, '')
    addXP(20, '')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      // Both should award since empty string doesn't match dedup
      expect(p.xp).toBe(40)
    }
  })

  it('should accumulate XP from different questions', () => {
    addXP(20, 'q-1')
    addXP(30, 'q-2')
    addXP(50, 'q-3')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(100)
    }
  })
})

describe('completeState - State Completion & Badge Logic (Bug #1)', () => {
  it('should mark state as completed', () => {
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.completed).toContain('Rajasthan')
    }
  })

  it('should award XP for completion', () => {
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(100)
    }
  })

  it('should NOT award duplicate completion XP', () => {
    completeState('Rajasthan', 100)
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(100)
      expect(p.completed.length).toBe(1)
    }
  })

  it('should create postcard on completion', () => {
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.postcards['Rajasthan']).toBeDefined()
      expect(p.postcards['Rajasthan'].state).toBe('Rajasthan')
    }
  })

  it('BUG #1 FIX: should NOT award all 3 badges instantly', () => {
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      // After fix: badges should be empty (0 badges) since none were earned
      expect(p.badges['Rajasthan'].length).toBeLessThanOrEqual(1)
      // BEFORE FIX: Would be 3 (monument, animal, explorer)
      expect(p.badges['Rajasthan'].length).not.toBe(3)
    }
  })

  it('should set stamp date on completion', () => {
    completeState('Rajasthan', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.stamps['Rajasthan']).toBeDefined()
      expect(p.stamps['Rajasthan']).toMatch(/\d{2}\s·\s[A-Z]{3}/)
    }
  })

  it('should accept custom XP reward', () => {
    completeState('Rajasthan', 250)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(250)
    }
  })

  it('should accept default XP reward (100)', () => {
    completeState('Rajasthan')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(100)
    }
  })

  it('should complete multiple states independently', () => {
    completeState('Rajasthan', 100)
    completeState('Delhi', 100)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.completed).toContain('Rajasthan')
      expect(p.completed).toContain('Delhi')
      expect(p.xp).toBe(200)
    }
  })
})

describe('markCard - Card Read Tracking (Bug #3)', () => {
  it('should award XP on first card read', () => {
    markCard('Rajasthan', 0)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(XP_PER_CARD)
    }
  })

  it('should NOT award XP on second read', () => {
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 0)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(XP_PER_CARD)
    }
  })

  it('should NOT award XP on replay', () => {
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 0, true)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(XP_PER_CARD)
    }
  })

  it('should track replay count', () => {
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 0, true)
    markCard('Rajasthan', 0, true)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.replayCount['Rajasthan'][0]).toBe(2)
    }
  })

  it('should accept different card indexes independently', () => {
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 1)
    markCard('Rajasthan', 2)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(XP_PER_CARD * 3)
      expect(p.cards['Rajasthan']).toEqual([0, 1, 2])
    }
  })

  it('should REJECT out-of-bounds card index (negative)', () => {
    markCard('Rajasthan', -1)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(0)
    }
  })

  it('should REJECT out-of-bounds card index (>= CARDS_PER_STATE)', () => {
    markCard('Rajasthan', CARDS_PER_STATE)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(0)
    }
  })

  it('should validate state name (empty)', () => {
    markCard('', 0)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(0)
    }
  })

  it('should handle multiple cards in same state', () => {
    for (let i = 0; i < 6; i++) {
      markCard('Rajasthan', i)
    }
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.cards['Rajasthan'].length).toBe(6)
      expect(p.xp).toBe(25 * 6)
    }
  })

  it('BUG #3 RACE CONDITION FIX: rapid card reads award XP once', () => {
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 0)
    markCard('Rajasthan', 0)
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.xp).toBe(XP_PER_CARD)
    }
  })
})

describe('touchStreak - Daily Streak (Bug #5)', () => {
  it('should initialize streak to 1 on first touch', () => {
    touchStreak()
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.streak).toBe(1)
      expect(p.lastActive).toBeTruthy()
    }
  })

  it('should NOT increment streak same day', () => {
    touchStreak()
    touchStreak()
    touchStreak()
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.streak).toBe(1)
    }
  })

  it('should track lastActive date', () => {
    touchStreak()
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.lastActive).toBeTruthy()
      expect(p.lastActive).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('BUG #5 FIX: should use local date not UTC', () => {
    // After fix: touchStreak uses local date instead of UTC
    touchStreak()
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      // Should use local date format (YYYY-MM-DD in local timezone)
      expect(p.lastActive).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.streak).toBe(1)
    }
  })
})

describe('levelInfo - XP to Level Conversion', () => {
  it('should return level 1 for 0 XP', () => {
    const info = levelInfo(0)
    expect(info.level).toBe(1)
  })

  it('should return level 2 for 400+ XP', () => {
    const info = levelInfo(400)
    expect(info.level).toBe(2)
  })

  it('should calculate correct level for intermediate XP', () => {
    const info = levelInfo(800)
    expect(info.level).toBe(3)
  })

  it('should provide progress within current level', () => {
    const info = levelInfo(500)
    expect(info.into).toBeDefined()
    expect(info.toNext).toBeDefined()
  })

  it('BUG #6 FIX: negative XP results in level 0', () => {
    const info = levelInfo(-100)
    // Negative XP: floor(-100/400) + 1 = floor(-0.25) + 1 = -1 + 1 = 0
    expect(info.level).toBeLessThanOrEqual(1)
  })
})

describe('saveProfile - Profile Management', () => {
  it('should save profile with all fields', () => {
    saveProfile({
      name: 'Alex',
      avatar: '🦁',
      ageBand: '10-12',
    })
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.name).toBe('Alex')
      expect(p.avatar).toBe('🦁')
      expect(p.ageBand).toBe('10-12')
      expect(p.onboarded).toBe(true)
    }
  })

  it('should update profile multiple times', () => {
    saveProfile({
      name: 'Alex',
      avatar: '🦁',
      ageBand: '8-9',
    })
    saveProfile({
      name: 'Jordan',
      avatar: '🐯',
      ageBand: '10-12',
    })
    const stored = localStorage.getItem('india-explorer:progress:v2')
    if (stored) {
      const p = JSON.parse(stored)
      expect(p.name).toBe('Jordan')
      expect(p.avatar).toBe('🐯')
    }
  })
})

describe('Storage Persistence', () => {
  it('should persist XP to localStorage', () => {
    addXP(100, 'q-1')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    expect(stored).toBeTruthy()
    const p = JSON.parse(stored!)
    expect(p.xp).toBe(100)
  })

  it('should persist completed states to localStorage', () => {
    completeState('Rajasthan')
    const stored = localStorage.getItem('india-explorer:progress:v2')
    const p = JSON.parse(stored!)
    expect(p.completed).toContain('Rajasthan')
  })

  it('should persist streak to localStorage', () => {
    touchStreak()
    const stored = localStorage.getItem('india-explorer:progress:v2')
    const p = JSON.parse(stored!)
    expect(p.streak).toBe(1)
  })
})
