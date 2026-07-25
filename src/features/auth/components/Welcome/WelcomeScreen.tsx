import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Building2, ShieldCheck, Sparkles, PartyPopper } from 'lucide-react';

import { Button } from '../../../../components/ui/Button/Button';

import styles from './WelcomeScreen.module.scss';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Add your first employee',
    description: 'Bring your team on board and start managing people in minutes.',
  },
  {
    icon: Building2,
    title: 'Define departments & roles',
    description: 'Shape your organization exactly the way it works.',
  },
  {
    icon: ShieldCheck,
    title: 'Set policies in minutes',
    description: 'Leave, attendance and payroll rules — ready right out of the box.',
  },
];

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <PartyPopper className={styles.confettiIcon} strokeWidth={2} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>Welcome to Brello!</h1>

        <div className={styles.badge}>
          <Sparkles size={14} />
          30 days free — every feature unlocked
        </div>

        <p className={styles.subtitle}>
          Your workspace is live and your full trial has just begun. Take your time — set things up
          at your own pace, and we&apos;ll be right beside you every step of the way.
        </p>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Here&apos;s how to get started</h3>
          <ul className={styles.list}>
            {STEPS.map(({ icon: Icon, title, description }) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepIcon}>
                  <Icon size={18} />
                </span>
                <span className={styles.stepText}>
                  <span className={styles.stepTitle}>{title}</span>
                  <span className={styles.stepDescription}>{description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.footerText}>No credit card required — cancel anytime.</p>

        <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate('/')}>
          Set up my workspace
        </Button>
      </div>
    </div>
  );
};
