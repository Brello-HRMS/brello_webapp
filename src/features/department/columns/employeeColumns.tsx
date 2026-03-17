import { ActionCell } from '../components/ActionCell';

import type { ColumnDef } from '@tanstack/react-table';
import type { Employee } from '../data/dummyEmployees';

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'employeeId',
    header: 'Employee ID',
    size: 150,
  },
  {
    accessorKey: 'name',
    header: 'Employee Name',
    size: 250,
    cell: (info) => {
      const employee = info.row.original;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <img
            src={employee.avatar}
            alt={employee.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span>{employee.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'designation',
    header: 'Designation',
    size: 200,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    size: 150,
    cell: (info) => {
      const type = info.getValue() as string;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor:
                type === 'Office' ? 'var(--color-success-500)' : 'var(--color-warning-500)',
            }}
          />
          <span>{type}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: (info) => {
      const status = info.getValue() as string;
      return (
        <span
          style={{
            color: status === 'Permanent' ? 'var(--color-primary-500)' : 'var(--color-warning-500)',
            fontWeight: 500,
          }}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 100,
    cell: (info) => <ActionCell employeeId={info.row.original.employeeId} />,
  },
];
