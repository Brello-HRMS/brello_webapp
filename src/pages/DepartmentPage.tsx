import React from 'react';
import { Eye, ChevronRight, ChevronDown, Download, Plus } from 'lucide-react';

import { DataTable } from '../components/common/DataTable';
import { NoDataFound } from '../components/common/NoDataFound';
import no_department from '../assets/svg/department/no_department_found.svg';
import { PageHeader } from '../components/common/PageHeader/PageHeader';
import { Button } from '../components/common/Button/Button';

import type { ColumnDef } from '@tanstack/react-table';

interface Employee {
  id: string;
  name: string;
  designation: string;
  type: 'Office' | 'Remote';
  status: 'Permanent' | 'Temporary';
  avatar: string;
  subRows?: Employee[];
}

const DepartmentPage = () => {
  const [departmentList] = React.useState<Employee[]>([
    {
      id: 'D001',
      name: 'Design Department',
      designation: 'Department Head: John Doe',
      type: 'Office',
      status: 'Permanent',
      avatar: 'https://i.pravatar.cc/150?u=design',
      subRows: [
        {
          id: '345321456',
          name: 'John Doe',
          designation: 'Lead UX Designer',
          type: 'Office',
          status: 'Permanent',
          avatar: 'https://i.pravatar.cc/150?u=john',
        },
        {
          id: '321434556',
          name: 'James Smith',
          designation: 'Lead UI/UX Designer',
          type: 'Office',
          status: 'Permanent',
          avatar: 'https://i.pravatar.cc/150?u=james',
        },
      ],
    },
    {
      id: 'D002',
      name: 'Product Department',
      designation: 'Department Head: Alice Alexander',
      type: 'Remote',
      status: 'Permanent',
      avatar: 'https://i.pravatar.cc/150?u=product',
      subRows: [
        {
          id: '332144556',
          name: 'Alice Alexander',
          designation: 'UI Strategist',
          type: 'Remote',
          status: 'Permanent',
          avatar: 'https://i.pravatar.cc/150?u=alice',
        },
      ],
    },
  ]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'id',
      header: 'Employee ID',
      cell: ({ row, getValue }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.getCanExpand() && (
            <button
              onClick={() => row.toggleExpanded()}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
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

  const handleAddDepartment = () => {
    // Logic to add department
  };

  if (departmentList.length === 0) {
    return (
      <NoDataFound
        title="No Departments Added Yet"
        description="Set up your first department to structure your organization and keep your workforce efficiently managed and organized."
        noDataImage={no_department}
        noDataImageAlt="No Department Found"
        buttonText="Add New Department"
        showButtonIcon
        onButtonClick={handleAddDepartment}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Define and manage company departments."
        actions={
          <>
            <Button variant="secondary">
              <Download size={16} />
              Export
            </Button>
            <Button variant="primary">
              <Plus size={16} />
              Add department
            </Button>
          </>
        }
      />
      <DataTable columns={columns} data={departmentList} />
    </div>
  );
};

export default DepartmentPage;
