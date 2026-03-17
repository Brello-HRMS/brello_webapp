import { useParams } from 'react-router-dom';

import { PageHeader } from '../components/common';

import styles from './department/DepartmentDetailPage.module.scss'; // Reusing styles for now

const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={styles.container}>
      <PageHeader title="Employee Profile" subtitle={`Viewing details for Employee ID: ${id}`} />
      <div
        style={{
          padding: '24px',
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginTop: '24px',
        }}
      >
        <h3>Details for {id}</h3>
        <p>This is a placeholder for the employee profile page.</p>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
