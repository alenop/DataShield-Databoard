import i18n from '../i18n'
import type {
  CreateDataExportInput,
  DataExport,
  ExportFormat,
  ExportSourceOption,
} from '../types/dataExport.types'
import { EXPORT_FORMAT_EXTENSIONS } from '../types/dataExport.types'
import { normalizeScope } from './sourceScope.utils'

export function formatExportSize(sizeBytes: number): string {
  if (sizeBytes <= 0) return '—'

  const gb = sizeBytes / 1024 ** 3
  if (gb >= 1) return `${gb.toFixed(1)} Go`

  const mb = sizeBytes / 1024 ** 2
  return `${Math.round(mb)} Mo`
}

export function generateExportFileName(baseName: string, format: ExportFormat): string {
  const trimmed = baseName.trim().replace(/\s+/g, '_')
  const extension = EXPORT_FORMAT_EXTENSIONS[format]
  if (trimmed.toLowerCase().endsWith(extension)) return trimmed
  return `${trimmed}${extension}`
}

export function isValidExportDate(exportDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exportDate.trim())) return false

  const parsed = new Date(`${exportDate.trim()}T00:00:00`)
  return !Number.isNaN(parsed.getTime())
}

export function formatExportDate(exportDate: string): string {
  if (!isValidExportDate(exportDate)) return exportDate

  const [year, month, day] = exportDate.split('-')
  return `${day}/${month}/${year}`
}

export function getTodayExportDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function validateCreateExportInput(
  input: CreateDataExportInput,
  existingNames: string[],
  sources: ExportSourceOption[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.exportNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return i18n.t('validation.exportNameDuplicate')
  }

  const source = sources.find((item) => item.id === input.sourceId)
  if (!source) return i18n.t('validation.invalidSource')

  const scope = input.scope
  if (!scope) return i18n.t('validation.exportScopeRequired')
  if (!source.scopes.includes(scope)) {
    return i18n.t('validation.exportScopeInvalid')
  }

  if (!isValidExportDate(input.exportDate)) {
    return i18n.t('validation.exportDateInvalid')
  }

  return null
}

export function createDataExport(input: CreateDataExportInput): DataExport {
  return {
    id: crypto.randomUUID(),
    name: generateExportFileName(input.name, input.format),
    format: input.format,
    sizeBytes: 0,
    status: 'preparing',
    sourceId: input.sourceId,
    scope: input.scope,
    exportDate: input.exportDate.trim(),
    createdAt: new Date().toISOString(),
  }
}

export function simulateExportSizeBytes(): number {
  const minGb = 0.5
  const maxGb = 6
  const gb = minGb + Math.random() * (maxGb - minGb)
  return Math.round(gb * 1024 ** 3)
}

export function parseStoredDataExports(
  stored: string | null,
  fallback: DataExport[],
): DataExport[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeDataExport)
      .filter((item): item is DataExport => item !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function isExportFormat(value: string): value is ExportFormat {
  return value === 'csv' || value === 'json' || value === 'sql_dump' || value === 'parquet'
}

function isExportStatus(value: string): value is DataExport['status'] {
  return value === 'ready' || value === 'preparing' || value === 'expired'
}

function normalizeDataExport(raw: unknown): DataExport | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<DataExport>
  const name = record.name?.trim()
  const format = record.format
  const sourceId = record.sourceId?.trim()
  const createdAt = record.createdAt?.trim()
  const scope = normalizeScope(record.scope)
  const exportDate =
    record.exportDate?.trim() ||
    (createdAt ? createdAt.slice(0, 10) : getTodayExportDate())

  if (!name || !format || !isExportFormat(format) || !sourceId || !createdAt) return null

  const status = record.status && isExportStatus(record.status) ? record.status : 'ready'

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    name,
    format,
    sizeBytes: typeof record.sizeBytes === 'number' ? record.sizeBytes : 0,
    status,
    sourceId,
    scope,
    exportDate,
    createdAt,
  }
}

