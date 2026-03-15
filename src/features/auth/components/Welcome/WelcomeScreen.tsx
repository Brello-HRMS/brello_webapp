import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../../components/ui/Button/Button';
import welcomeImage from '../../../../assets/welcom.png';

import styles from './WelcomeScreen.module.scss';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.confettiIcon}>
        {/* <img src={confettiIllustration} alt="Confetti" className={styles.confettiIcon} /> */}
        {/* <img src={confettiIllustration} alt="Confetti" className={styles.confettiIcon} /> */}
        <img src={welcomeImage} alt="Welcome" className={styles.confettiIcon} />
      </div>

      <h1 className={styles.title}>Welcome to Brello!</h1>

      <div className={styles.badge}>⏱ Trial: 30 Days Remaining</div>

      <p className={styles.subtitle}>
        Your workspace is live. Everything is ready. Let's set things in motion.
      </p>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>What Happens Next-</h3>
        <ul className={styles.list}>
          <li>
            <span className={styles.dot}></span> Add Your First Employee
          </li>
          <li>
            <span className={styles.dot}></span> Define Departments &amp; Roles
          </li>
          <li>
            <span className={styles.dot}></span> Set Policies In Minutes
          </li>
        </ul>
      </div>

      <p className={styles.footerText}>Your HR Engine is waiting to be started!</p>

      <Button
        variant="primary"
        style={{ width: '100%', maxWidth: '450px' }}
        onClick={() => navigate('/')}
      >
        Get Started
      </Button>
    </div>
  );
};
