import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface ActionCellProps {
  employeeId: string;
  disabled?: boolean;
}

export const ActionCell = ({ employeeId, disabled }: ActionCellProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => !disabled && navigate(`/employee/profile/${employeeId}`)}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: 'var(--color-text-secondary)',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={disabled ? 'Action disabled' : 'View Profile'}
      disabled={disabled}
    >
      <Eye size={18} />
    </button>
  );
};
