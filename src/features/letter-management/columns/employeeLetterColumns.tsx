import { Eye } from 'lucide-react';

import { Button } from '../../../components/common';
import { IssuedLetterStatusBadge } from '../components/IssuedLetterStatusBadge/IssuedLetterStatusBadge';

import type { ColumnDef } from '@tanstack/react-table';
import type { IssuedLetter } from '../types/letterTypes';

export interface EmployeeLetterGroup {
  employeeId: string;
  employeeName: string;
  letters: IssuedLetter[];
  latestLetter: IssuedLetter;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.[0] || '?';
  return initials.toUpperCase();
};

interface EmployeeLetterColumnProps {
  onViewLetters: (group: EmployeeLetterGroup) => void;
}

export const employeeLetterColumns = ({
  onViewLetters,
}: EmployeeLetterColumnProps): ColumnDef<EmployeeLetterGroup>[] => {
  return [
    {
      id: 'employee',
      header: 'Employee',
      size: 260,
      cell: (info) => {
        const { employeeName } = info.row.original;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'var(--font-size-xs)',
                flexShrink: 0,
              }}
            >
              {getInitials(employeeName)}
            </div>
            <span
              style={{
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {employeeName}
            </span>
          </div>
        );
      },
    },
    {
      id: 'letterCount',
      header: 'Letters',
      size: 120,
      cell: (info) => {
        const count = info.row.original.letters.length;
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: 'var(--font-size-xs)',
              backgroundColor: 'var(--color-blue-50)',
              color: 'var(--color-blue-600)',
              fontWeight: 500,
            }}
          >
            {count} {count === 1 ? 'Letter' : 'Letters'}
          </span>
        );
      },
    },
    {
      id: 'latestStatus',
      header: 'Latest Status',
      size: 160,
      cell: (info) => (
        <IssuedLetterStatusBadge status={info.row.original.latestLetter.delivery_status} />
      ),
    },
    {
      id: 'latestDate',
      header: 'Latest Letter',
      size: 150,
      cell: (info) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(info.row.original.latestLetter.generated_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 160,
      cell: (info) => (
        <Button variant="secondary" size="sm" onClick={() => onViewLetters(info.row.original)}>
          <Eye size={14} />
          View Letters
        </Button>
      ),
    },
  ];
};
