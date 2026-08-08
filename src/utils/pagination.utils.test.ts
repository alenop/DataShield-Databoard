import { paginateItems } from './pagination.utils'

describe('paginateItems', () => {
  const items = Array.from({ length: 12 }, (_, index) => index + 1)

  it('returns the requested page slice', () => {
    const page1 = paginateItems(items, 1, 5)
    expect(page1.items).toEqual([1, 2, 3, 4, 5])
    expect(page1.totalPages).toBe(3)
    expect(page1.totalItems).toBe(12)

    const page3 = paginateItems(items, 3, 5)
    expect(page3.items).toEqual([11, 12])
  })

  it('clamps page number to valid range', () => {
    const result = paginateItems(items, 99, 5)
    expect(result.currentPage).toBe(3)
    expect(result.items).toEqual([11, 12])
  })
})
