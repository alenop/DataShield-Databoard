import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TFunction } from 'i18next'
import type { BackupVolumePoint } from '../../types/backup.types'
import { formatBackupSize } from '../../utils/backupFormatters'

interface BackupVolumeChartProps {
  data: BackupVolumePoint[]
}

function CustomTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean
  payload?: { value: number; payload: BackupVolumePoint }[]
  t: TFunction
}) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md dark:border-slate-600 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{point.label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {formatBackupSize(point.volumeGb, t)}
      </p>
    </div>
  )
}

export function BackupVolumeChart({ data }: BackupVolumeChartProps) {
  const { t } = useTranslation()
  const totalVolume = data.reduce((sum, point) => sum + point.volumeGb, 0)
  const volumeUnit = t('common.volumeUnit')

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.last7Days')}</p>
        <p className="text-lg font-semibold text-slate-900 tabular-nums dark:text-white">
          {totalVolume.toFixed(1)} {volumeUnit}{' '}
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{t('common.total')}</span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${value} ${volumeUnit}`}
          />
          <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="volumeGb" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
