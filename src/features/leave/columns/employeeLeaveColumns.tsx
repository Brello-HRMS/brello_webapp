import React from 'react';
import { Send, Trash2, XCircle } from 'lucide-react';
import moment from 'moment';
import { Tooltip } from 'react-leaflet';

import { StatusBadge } from '../../../components/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { LeaveRequest } from '../types/leaveRequestTypes';

interface EmployeeLeaveColumnsProps {
  onSubmit?: (request: LeaveRequest) => void;
  onCancel?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
}

export const employeeLeaveColumns = ({
  onSubmit,
  onCancel,
  onDelete,
}: EmployeeLeaveColumnsProps): ColumnDef<LeaveRequest, unknown>[] => [
  {
    accessorKey: 'from_date',
    header: 'Date Range',
    cell: ({ row }) => {
      const from = moment(row.original.from_date).format('MMM DD, YYYY');
      const to = moment(row.original.to_date).format('MMM DD, YYYY');
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500 }}>
            {from} {from !== to ? `- ${to}` : ''}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {row.original.total_days} {row.original.total_days === 1 ? 'day' : 'days'}
            {row.original.is_half_day && ` (${row.original.half_day_session})`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ getValue }) => {
      const reason = getValue<string>();
      return (
        <Tooltip content={reason}>
          <div
            style={{
              maxWidth: 200,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {reason}
          </div>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return <StatusBadge status={status} />;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const req = row.original;

      return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {req.status === 'DRAFT' && (
            <>
              {onSubmit && (
                <button
                  onClick={() => onSubmit(req)}
                  title="Submit for approval"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary-600)',
                  }}
                >
                  <Send size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(req)}
                  title="Delete draft"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--danger-600)',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}

          {(req.status === 'PENDING_APPROVAL' || req.status === 'APPROVED') && onCancel && (
            <button
              onClick={() => onCancel(req)}
              title="Cancel request"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--danger-600)',
              }}
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      );
    },
  },
];
