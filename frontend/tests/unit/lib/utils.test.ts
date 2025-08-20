import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('btn', 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('btn', isActive && 'btn-active')
    expect(result).toBe('btn btn-active')
  })

  it('handles conflicting tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('handles undefined and null values', () => {
    const result = cn('btn', undefined, null, 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('handles arrays of classes', () => {
    const result = cn(['btn', 'btn-sm'], 'text-white')
    expect(result).toBe('btn btn-sm text-white')
  })

  it('handles objects with boolean values', () => {
    const result = cn({
      btn: true,
      'btn-active': true,
      'btn-disabled': false,
    })
    expect(result).toBe('btn btn-active')
  })
})