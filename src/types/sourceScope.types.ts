export const SOURCE_SCOPES = [
  'full',
  'contacts',
  'accounts',
  'leads',
  'opportunities',
  'aggregatedMetrics',
  'apiLogs',
] as const

export type SourceScope = (typeof SOURCE_SCOPES)[number]

export const DEFAULT_SOURCE_SCOPES: SourceScope[] = ['full']
