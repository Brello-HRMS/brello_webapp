import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './ForbiddenPage.module.scss';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <ShieldOff size={36} />
        </div>
        <h1 className={styles.code}>403</h1>
        <h2 className={styles.title}>Access Denied</h2>
        <p className={styles.description}>
          You don't have permission to view this page. Contact your administrator if you think this
          is a mistake.
        </p>
        <div className={styles.actions}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
