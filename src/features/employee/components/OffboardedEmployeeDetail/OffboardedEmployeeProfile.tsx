import React from 'react';
import { Lock, Calendar, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

import styles from './OffboardedEmployeeProfile.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';
import type { OffboardingStatus } from '../../../types/offboardingType';

interface Props {
  employee: EmployeeDetail;
  offboardingStatus: OffboardingStatus | null | undefined;
  employeeExited: boolean;
}

const formatDateStr = (dateString: string | undefined | null) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const OffboardedEmployeeProfile: React.FC<Props> = ({
  employee,
  offboardingStatus,
  employeeExited,
}) => {
  if (!offboardingStatus) return null;

  const { profile } = employee;
  const lwd = formatDateStr(offboardingStatus.last_working_day);
  const designation = profile?.designation || profile?.type || 'Employee';
  const empId = profile?.employeeId
    ? `EMP-${profile.employeeId}`
    : `EMP-${employee.id.substring(0, 3).toUpperCase()}`;

  // Time calculations
  const today = new Date();
  const lastDate = new Date(offboardingStatus.last_working_day);
  const diffTime = lastDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const remainingText = employeeExited
    ? 'Access revoked'
    : `${diffDays} days remaining: access will be auto-revoked`;

  const currentStatusText = employeeExited ? 'Final settlement done' : 'Pending final settlement';

  // Demo progress - logic could be more dynamic
  const clearanceProgress = employeeExited ? 100 : 75;

  return (
    <div className={`${styles.container} ${employeeExited ? styles.exited : ''}`}>
      {/* Banner */}
      <div className={styles.banner}>
        <div>
          <h3>Last working day: {lwd}</h3>
          <p>{remainingText}</p>
        </div>
        <div className={styles.statusBadge}>
          {employeeExited ? 'Employee exited' : 'Offboarding in process'}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.column}>
          {/* User Card */}
          <div className={styles.profileCard}>
            <div className={styles.employeeSummary}>
              <div className={styles.avatar}>
                {employee.avatar ? (
                  <img src={employee.avatar} alt="Avatar" />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '12px',
                      fontSize: '32px',
                      fontWeight: 600,
                      color: '#9ca3af',
                    }}
                  >
                    {employee.firstName.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.info}>
                <h2>
                  {employee.firstName} {employee.lastName}
                </h2>
                <p>{designation}</p>
                <span className={styles.empId}>ID: {empId}</span>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.label}>Clearance Progress</span>
                <span className={styles.percent}>{clearanceProgress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${clearanceProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Locked Items Card */}
          <div className={styles.lockedCard}>
            <h4>
              <Briefcase size={18} /> Locked after offboarding initiated
            </h4>
            <div className={styles.lockedList}>
              <div className={styles.lockedItem}>
                <span className={styles.label}>Department</span>
                <span className={styles.value}>
                  {profile?.department || '—'} <Lock size={14} />
                </span>
              </div>
              <div className={styles.lockedItem}>
                <span className={styles.label}>Manager</span>
                <span className={styles.value}>
                  {employee.reportsTo || '—'} <Lock size={14} />
                </span>
              </div>
              <div className={styles.lockedItem}>
                <span className={styles.label}>Payroll grade</span>
                <span className={styles.value}>
                  18 LPA <Lock size={14} /> {/* Hardcoded mockup placeholder as per layout */}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.column}>
          <div className={styles.statusCard}>
            <div className={styles.headerRow}>
              <div className={styles.statusGroup}>
                <div className={styles.label}>Last Working Day</div>
                <div className={styles.val}>{lwd}</div>
              </div>
              <div className={styles.statusGroup}>
                <div className={styles.label}>Initiated by</div>
                <div className={styles.val}>HR Admin</div>
              </div>
            </div>
            <div className={styles.currentStatus}>
              <div className={styles.label}>Current Status</div>
              <div className={styles.pill}>{currentStatusText}</div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardHeader}>Personal Info</h3>
            <div className={styles.personalInfoList}>
              <div className={styles.infoRow}>
                <Calendar className={styles.iconWrapper} size={20} />
                <div className={styles.infoContent}>
                  <div className={styles.label}>Date of Birth</div>
                  <div className={styles.val}>{formatDateStr(profile?.dob) || '—'}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <Mail className={styles.iconWrapper} size={20} />
                <div className={styles.infoContent}>
                  <div className={styles.label}>Email Address</div>
                  <div className={styles.val}>{employee.email || '—'}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <Phone className={styles.iconWrapper} size={20} />
                <div className={styles.infoContent}>
                  <div className={styles.label}>Phone</div>
                  <div className={styles.val}>{employee.phone || '—'}</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <MapPin className={styles.iconWrapper} size={20} />
                <div className={styles.infoContent}>
                  <div className={styles.label}>Address</div>
                  <div className={styles.val}>
                    {profile?.address ||
                      'Flat 402, Shree Sai Residency, Linking Road, Bandra West, Mumbai'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Full Width */}
      <div className={styles.card}>
        <div className={styles.auditLog}>
          <h3>Audit Log</h3>
          <div className={styles.logList}>
            <div className={styles.logItem}>
              <div className={styles.logDesc}>
                <h4>Offboarding initiated</h4>
                <p>by HR Admin</p>
              </div>
              <div className={styles.logDate}>{formatDateStr(offboardingStatus.created_at)}</div>
            </div>
            <div className={styles.logItem}>
              <div className={styles.logDesc}>
                <h4>Fields locked: department, manager, payroll grade</h4>
                <p>by System</p>
              </div>
              <div className={styles.logDate}>{formatDateStr(offboardingStatus.created_at)}</div>
            </div>
            <div className={styles.logItem}>
              <div className={styles.logDesc}>
                <h4>System access will be auto-revoked</h4>
                <p>by System</p>
              </div>
              <div className={styles.logDate}>
                {formatDateStr(offboardingStatus.last_working_day)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
