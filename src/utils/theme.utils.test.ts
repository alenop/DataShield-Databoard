import { resolveInitialTheme } from './theme.utils'

describe('resolveInitialTheme', () => {
  it('returns stored light theme', () => {
    expect(resolveInitialTheme('light', true)).toBe('light')
  })

  it('returns stored dark theme', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark')
  })

  it('falls back to dark when system prefers dark', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
  })

  it('falls back to light when system prefers light', () => {
    expect(resolveInitialTheme(null, false)).toBe('light')
  })

  it('ignores invalid stored values', () => {
    expect(resolveInitialTheme('invalid', false)).toBe('light')
  })
})
