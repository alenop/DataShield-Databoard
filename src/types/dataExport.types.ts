import type { SourceScope } from './sourceScope.types'

export type ExportFormat = 'csv' | 'json' | 'sql_dump' | 'parquet'

export type ExportStatus = 'ready' | 'preparing' | 'expired'

export interface DataExport {
  id: string
  name: string
  format: ExportFormat
  sizeBytes: number
  status: ExportStatus
  backupId: string
  sourceId: string
  scopes: SourceScope[]
  exportDate: string
  createdAt: string
  linkExpiresAt: string | null
}

export interface CreateDataExportInput {
  name: string
  format: ExportFormat
  backupId: string
  scopes: SourceScope[]
  exportDate: string
}

export interface ExportBackupOption {
  id: string
  name: string
  sourceId: string
  sourceName: string
  date: string
  scopes: SourceScope[]
}

export const exportFormatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  json: 'JSON',
  sql_dump: 'SQL Dump',
  parquet: 'Parquet',
}

export const exportStatusLabels: Record<ExportStatus, string> = {
  ready: 'Prêt',
  preparing: 'En préparation',
  expired: 'Expiré',
}

export const EXPORT_FORMATS: ExportFormat[] = ['csv', 'json', 'sql_dump', 'parquet']

export const EXPORT_FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: '.csv',
  json: '.json',
  sql_dump: '.sql',
  parquet: '.parquet',
}

export const EXPORT_PREPARATION_MS = 6000

/** Download link validity after export is ready (7 days). */
export const EXPORT_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000
