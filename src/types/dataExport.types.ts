export type ExportFormat = 'csv' | 'json' | 'sql_dump' | 'parquet'

export type ExportStatus = 'ready' | 'preparing' | 'expired'

export interface DataExport {
  id: string
  name: string
  format: ExportFormat
  sizeBytes: number
  status: ExportStatus
  sourceId: string
  scope: string
  exportDate: string
  createdAt: string
}

export interface CreateDataExportInput {
  name: string
  format: ExportFormat
  sourceId: string
  scope: string
  exportDate: string
}

export interface ExportSourceOption {
  id: string
  scopes: string[]
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
