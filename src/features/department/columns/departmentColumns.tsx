import { Eye } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';
import type { Employee } from '../data/departmentData';

export const departmentColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'id',
    header: 'Employee ID',
    cell: ({ getValue }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong>{getValue() as string}</strong>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Employee Name',
    cell: (info) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={(info.row.original as Employee).avatar}
          alt=""
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
        />
        <span>{info.getValue() as string}</span>
      </div>
    ),
  },
  {
    accessorKey: 'designation',
    header: 'Designation',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: (info) => (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '16px',
          background: info.getValue() === 'Office' ? '#ecfdf3' : '#fff7ed',
          color: info.getValue() === 'Office' ? '#027a48' : '#c2410c',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        • {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '6px',
          background: '#f2f4f7',
          color: '#344054',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {info.getValue() as string}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <button style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#667085' }}>
        <Eye size={18} />
      </button>
    ),
  },
];
