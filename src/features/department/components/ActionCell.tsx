import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface ActionCellProps {
  employeeId: string;
}

export const ActionCell = ({ employeeId }: ActionCellProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/employee/profile/${employeeId}`)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="View Profile"
    >
      <Eye size={18} />
    </button>
  );
};
