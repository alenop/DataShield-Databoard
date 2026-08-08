import { buildMockBackupRecords } from '../data/mockBackups'
import { defaultBackupSources } from '../data/defaultBackupSources'
import {
  buildBackupVolumeFromRecords,
  sumSuccessfulBackupVolumeForDay,
} from './backupVolume.utils'

const referenceDate = new Date('2026-08-08T12:00:00Z')

describe('buildMockBackupRecords', () => {
  it('returns an empty list when no sources are configured', () => {
    expect(buildMockBackupRecords([])).toEqual([])
  })

  it('assigns backups to the configured sources', () => {
    const sources = defaultBackupSources.slice(0, 2)
    const records = buildMockBackupRecords(sources, referenceDate)

    expect(records.length).toBeGreaterThan(0)
    expect(records.every((record) => sources.some((source) => source.id === record.sourceId))).toBe(
      true,
    )
    expect(new Set(records.map((record) => record.sourceId)).size).toBeGreaterThan(1)
  })

  it('sorts backups from most recent to oldest', () => {
    const records = buildMockBackupRecords(defaultBackupSources, referenceDate)

    for (let index = 1; index < records.length; index += 1) {
      const previous = new Date(records[index - 1].date).getTime()
      const current = new Date(records[index].date).getTime()
      expect(previous).toBeGreaterThanOrEqual(current)
    }
  })
})

describe('buildBackupVolumeFromRecords', () => {
  it('builds seven daily points ending on the reference day', () => {
    const records = buildMockBackupRecords(defaultBackupSources, referenceDate)
    const volume = buildBackupVolumeFromRecords(records, 7, referenceDate)
    const referenceDay = buildBackupVolumeFromRecords([], 1, referenceDate)[0]

    expect(volume).toHaveLength(7)
    expect(volume[volume.length - 1].date).toBe(referenceDay.date)
  })

  it('matches the sum of successful and in-progress backups for each day', () => {
    const records = buildMockBackupRecords(defaultBackupSources, referenceDate)
    const volume = buildBackupVolumeFromRecords(records, 7, referenceDate)

    volume.forEach((point) => {
      const [year, month, day] = point.date.split('-').map(Number)
      const expectedVolume = sumSuccessfulBackupVolumeForDay(records, new Date(year, month - 1, day))
      expect(point.volumeGb).toBe(Math.round(expectedVolume * 10) / 10)
    })
  })

  it('ignores failed backups in the volume chart', () => {
    const records = buildMockBackupRecords(defaultBackupSources, referenceDate)
    const failedTodayVolume = records
      .filter((record) => record.status === 'failure')
      .reduce((sum, record) => sum + record.sizeGb, 0)

    expect(failedTodayVolume).toBeGreaterThan(0)

    const todayVolume = buildBackupVolumeFromRecords(records, 1, referenceDate)[0].volumeGb
    const countedTodayVolume = sumSuccessfulBackupVolumeForDay(records, referenceDate)

    expect(todayVolume).toBe(Math.round(countedTodayVolume * 10) / 10)
    expect(todayVolume).toBeLessThan(Math.round((countedTodayVolume + failedTodayVolume) * 10) / 10)
  })
})
