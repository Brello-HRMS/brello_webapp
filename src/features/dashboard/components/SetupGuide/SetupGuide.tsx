import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minimize2, ChevronDown, ChevronUp, Check, Maximize2 } from 'lucide-react';

import { useOrgSetupStatus } from '../../hooks/useOrgSetupStatus';

import styles from './SetupGuide.module.scss';

export const SetupGuide: React.FC = () => {
  const { data, isLoading } = useOrgSetupStatus();
  const navigate = useNavigate();

  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('brello_setup_guide_minimized') === 'true';
  });
  const [isVisible, setIsVisible] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'org' | 'employees'>('org');

  const handleMinimizeToggle = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('brello_setup_guide_minimized', String(newState));
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (isLoading || !data || !isVisible) {
    return null;
  }

  // If 100% completed, don't show the widget anymore
  if (data.completionPercentage === 100) {
    return null;
  }

  const { steps } = data;

  const renderStep = (label: string, isCompleted: boolean, path: string) => (
    <div className={styles.stepItem} onClick={() => navigate(path)}>
      <div className={`${styles.stepIcon} ${isCompleted ? styles.completed : styles.pending}`}>
        {isCompleted && <Check size={12} strokeWidth={3} />}
      </div>
      <span className={styles.stepText}>{label}</span>
    </div>
  );

  const getNextStep = () => {
    if (!steps.DEPARTMENTS)
      return { text: 'Setup Organisation (Department)', path: '/organisation/departments' };
    if (!steps.DESIGNATIONS)
      return { text: 'Setup Organisation (Designation)', path: '/organisation/designations' };
    if (!steps.COMPANY_POLICIES)
      return { text: 'Create your company policies', path: '/organisation/policies' };
    if (!steps.PAYROLL) return { text: 'Set up payrolls', path: '/organisation/payroll' };
    if (!steps.LEAVE)
      return { text: 'Set up leave configuration', path: '/organisation/leave-config' };
    if (!steps.ATTENDANCE) return { text: 'Set up attendance rules', path: '/attendance/setup' };
    if (!steps.EMPLOYEES) return { text: 'Add Employees', path: '/employee/directory' };
    return null;
  };

  const nextStep = getNextStep();

  if (isMinimized) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Setup guide</h3>
          <div className={styles.actions}>
            <button onClick={handleMinimizeToggle} title="Expand">
              <Maximize2 size={16} />
            </button>
            <button onClick={handleClose} title="Dismiss">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${data.completionPercentage}%` }}
            />
          </div>
        </div>

        {nextStep && (
          <div className={styles.nextStepContainer}>
            <span className={styles.nextLabel}>Next: </span>
            <span className={styles.nextLink} onClick={() => navigate(nextStep.path)}>
              {nextStep.text}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Setup guide</h3>
        <div className={styles.actions}>
          <button onClick={handleMinimizeToggle} title="Minimize">
            <Minimize2 size={16} />
          </button>
          <button onClick={handleClose} title="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${data.completionPercentage}%` }}
          />
        </div>
      </div>

      <div className={styles.content}>
        {/* Set up organisation accordion */}
        <div className={styles.accordion}>
          <button
            className={styles.accordionHeader}
            onClick={() => setExpandedSection(expandedSection === 'org' ? 'employees' : 'org')}
          >
            Set up organisation
            {expandedSection === 'org' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSection === 'org' && (
            <div className={styles.accordionContent}>
              {renderStep('Add your departments', steps.DEPARTMENTS, '/organisation/departments')}
              {renderStep(
                'Add your designations',
                steps.DESIGNATIONS,
                '/organisation/designations',
              )}
              {renderStep(
                'Create your company policies',
                steps.COMPANY_POLICIES,
                '/organisation/policies',
              )}
              {renderStep('Set up payrolls', steps.PAYROLL, '/organisation/payroll')}
              {renderStep('Set up leave configuration', steps.LEAVE, '/organisation/leave-config')}
              {renderStep('Set up attendance rules', steps.ATTENDANCE, '/attendance/setup')}
            </div>
          )}
        </div>

        {/* Add Employees accordion */}
        <div className={styles.accordion}>
          <button
            className={styles.accordionHeader}
            onClick={() =>
              setExpandedSection(expandedSection === 'employees' ? 'org' : 'employees')
            }
          >
            Add Employees
            {expandedSection === 'employees' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSection === 'employees' && (
            <div className={styles.accordionContent}>
              {renderStep('Add employees', steps.EMPLOYEES, '/employee/directory')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
