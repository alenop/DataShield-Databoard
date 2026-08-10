import type { DataExport } from '../types/dataExport.types'



export const mockDataExports: DataExport[] = [

  {

    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',

    name: 'Export_Contacts_Salesforce_Q2.csv',

    format: 'csv',

    sizeBytes: 2.4 * 1024 ** 3,

    status: 'ready',

    sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

    scope: 'contacts',

    exportDate: '2026-06-30',

    createdAt: '2026-08-07T10:15:00',

  },

  {

    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',

    name: 'Export_Opportunities_2026.json',

    format: 'json',

    sizeBytes: 890 * 1024 ** 2,

    status: 'ready',

    sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

    scope: 'opportunities',

    exportDate: '2026-08-01',

    createdAt: '2026-08-06T16:42:00',

  },

  {

    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',

    name: 'Export_Full_DB_Backup.sql',

    format: 'sql_dump',

    sizeBytes: 5.1 * 1024 ** 3,

    status: 'expired',

    sourceId: 'b14eebc9-9c0b-41f8-bb6d-6bb9bd380b22',

    scope: 'contacts',

    exportDate: '2026-07-01',

    createdAt: '2026-07-15T08:00:00',

  },

  {

    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',

    name: 'Export_Metrics_Aggregated.parquet',

    format: 'parquet',

    sizeBytes: 0,

    status: 'preparing',

    sourceId: 'c24eebc9-9c0b-42f8-bb6d-6bb9bd380c33',

    scope: 'aggregatedMetrics',

    exportDate: '2026-08-07',

    createdAt: '2026-08-07T14:05:00',

  },

]

