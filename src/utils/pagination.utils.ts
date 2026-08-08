export interface PaginationResult<T> {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  startIndex: number
  endIndex: number
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const safePageSize = Math.max(1, pageSize)
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (currentPage - 1) * safePageSize
  const endIndex = Math.min(startIndex + safePageSize, totalItems)

  return {
    items: items.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    currentPage,
    pageSize: safePageSize,
    startIndex,
    endIndex,
  }
}
