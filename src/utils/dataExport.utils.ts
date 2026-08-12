import i18n from '../i18n'
import type { BackupRecord } from '../types/backup.types'
import type { BackupSource } from '../types/backupSource.types'
import type {
  CreateDataExportInput,
  DataExport,
  ExportBackupOption,
  ExportFormat,
} from '../types/dataExport.types'
import { EXPORT_FORMAT_EXTENSIONS, EXPORT_LINK_TTL_MS } from '../types/dataExport.types'
import type { SourceScope } from '../types/sourceScope.types'
import { resolveBackupSourceId } from './backupRecord.utils'
import {
  getExportScopeOptions,
  isValidExportScopesForBackup,
  normalizeScopes,
  sortScopes,
} from './sourceScope.utils'

export function buildExportBackupOptions(
  records: BackupRecord[],
  sources: BackupSource[],
): ExportBackupOption[] {
  return records
    .filter((backup) => backup.status === 'success')
    .flatMap((backup) => {
      const sourceId = resolveBackupSourceId(backup, sources)
      if (!sourceId) return []

      const source = sources.find((item) => item.id === sourceId)

      return [
        {
          id: backup.id,
          name: backup.name,
          sourceId,
          sourceName: source?.name ?? backup.source,
          date: backup.date,
          scopes: backup.scopes,
        },
      ]
    })
}

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

export function computeExportLinkExpiresAt(
  createdAt: string,
  status: DataExport['status'],
  explicit?: string | null,
): string | null {
  if (explicit !== undefined) return explicit
  if (status === 'preparing') return null

  const base = new Date(createdAt)
  if (Number.isNaN(base.getTime())) return null

  return new Date(base.getTime() + EXPORT_LINK_TTL_MS).toISOString()
}

export function formatLinkExpiration(iso: string | null, status: DataExport['status']): string {
  if (status === 'preparing') return '—'
  if (!iso) return '—'

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
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
  backups: ExportBackupOption[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.exportNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return i18n.t('validation.exportNameDuplicate')
  }

  const backup = backups.find((item) => item.id === input.backupId)
  if (!backup) return i18n.t('validation.invalidBackup')

  if (!isValidExportScopesForBackup(backup.scopes, input.scopes)) {
    return i18n.t('validation.exportScopeInvalid')
  }

  if (!isValidExportDate(input.exportDate)) {
    return i18n.t('validation.exportDateInvalid')
  }

  return null
}

export function createDataExport(
  input: CreateDataExportInput,
  backups: ExportBackupOption[],
): DataExport {
  const backup = backups.find((item) => item.id === input.backupId)

  return {
    id: crypto.randomUUID(),
    name: generateExportFileName(input.name, input.format),
    format: input.format,
    sizeBytes: 0,
    status: 'preparing',
    backupId: input.backupId,
    sourceId: backup?.sourceId ?? '',
    scopes: sortScopes(input.scopes),
    exportDate: input.exportDate.trim(),
    createdAt: new Date().toISOString(),
    linkExpiresAt: null,
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
  backups: ExportBackupOption[] = [],
): DataExport[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map((item) => normalizeDataExport(item, backups))
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

function readExportScopes(record: Partial<DataExport> & { scope?: SourceScope }): SourceScope[] {
  if (Array.isArray(record.scopes) && record.scopes.length > 0) {
    return normalizeScopes(record.scopes)
  }

  if (record.scope) {
    return [record.scope]
  }

  return []
}

function normalizeDataExport(
  raw: unknown,
  backups: ExportBackupOption[],
): DataExport | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<DataExport> & { scope?: SourceScope }
  const name = record.name?.trim()
  const format = record.format
  const createdAt = record.createdAt?.trim()
  const exportDate =
    record.exportDate?.trim() ||
    (createdAt ? createdAt.slice(0, 10) : getTodayExportDate())

  if (!name || !format || !isExportFormat(format) || !createdAt) return null

  const backupId = record.backupId?.trim()
  const backup = backupId ? backups.find((item) => item.id === backupId) : undefined
  const sourceId = record.sourceId?.trim() || backup?.sourceId || ''
  const rawScopes = readExportScopes(record)
  const scopes: SourceScope[] =
    rawScopes.length > 0
      ? sortScopes(
          rawScopes.filter((scope) =>
            backup ? getExportScopeOptions(backup.scopes).includes(scope) : true,
          ),
        )
      : backup
        ? [getExportScopeOptions(backup.scopes)[0] ?? 'full']
        : ['full']

  if (!backupId && !sourceId) return null

  const status = record.status && isExportStatus(record.status) ? record.status : 'ready'
  const linkExpiresAt = computeExportLinkExpiresAt(
    createdAt,
    status,
    record.linkExpiresAt ?? undefined,
  )

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    name,
    format,
    sizeBytes: typeof record.sizeBytes === 'number' ? record.sizeBytes : 0,
    status,
    backupId: backupId ?? '',
    sourceId,
    scopes,
    exportDate,
    createdAt,
    linkExpiresAt,
  }
}
