export function filterByListSearchQuery<T>(
  items: T[],
  query: string,
  getValues: (item: T) => Array<string | undefined | null>,
): T[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items

  return items.filter((item) =>
    getValues(item).some((value) => value?.toLowerCase().includes(normalized)),
  )
}
