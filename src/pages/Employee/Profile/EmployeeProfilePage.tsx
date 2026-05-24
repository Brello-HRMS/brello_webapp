import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '../../../components/common';
import { useEmployeeDetail } from '../../../features/employee/hooks/useEmployeeDetail';
import { useOffboardingStatus } from '../../../features/employee/hooks/useOffboarding';
import {
  EmployeeDetailHeader,
  EmployeeDetailPageHeader,
} from '../../../features/employee/components/EmployeeDetail/EmployeeDetailHeader/EmployeeDetailHeader';
import { EducationCard } from '../../../features/employee/components/EmployeeDetail/EducationCard/EducationCard';
import { ExperienceCard } from '../../../features/employee/components/EmployeeDetail/ExperienceCard/ExperienceCard';
import { DocumentsCard } from '../../../features/employee/components/EmployeeDetail/DocumentsCard/DocumentsCard';
import { AssetsCard } from '../../../features/employee/components/EmployeeDetail/AssetsCard/AssetsCard';
import { PersonalInfoCard } from '../../../features/employee/components/EmployeeDetail/PersonalInfoCard/PersonalInfoCard';
import { PayrollSummaryCard } from '../../../features/employee/components/EmployeeDetail/PayrollSummaryCard/PayrollSummaryCard';
import { LeaveBalanceCard } from '../../../features/employee/components/EmployeeDetail/LeaveBalanceCard/LeaveBalanceCard';
import {
  HoursLoggedMockCard,
  AttendanceCalendarMockCard,
} from '../../../features/employee/components/EmployeeDetail/AttendanceMockCard/AttendanceMockCard';
import { OffboardedEmployeeProfile } from '../../../features/employee/components/OffboardedEmployeeDetail/OffboardedEmployeeProfile';
import {
  InitiateOffboardingModal,
  OffboardingCaptureFlow,
} from '../../../features/employee/components/EmployeeDetail/OffboardingModals';

import styles from './EmployeeProfilePage.module.scss';

const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading: isEmpLoading, isError } = useEmployeeDetail(id);
  const { data: offboardingStatus, isLoading: isOffStatusLoading } = useOffboardingStatus(id);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
  const [effectiveImmediately, setEffectiveImmediately] = useState(false);

  const employee = response?.data;
  const isLoading = isEmpLoading || isOffStatusLoading;

  const isExited = offboardingStatus
    ? new Date(offboardingStatus.last_working_day).getTime() <= new Date().getTime()
    : false;

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <div style={{ marginBottom: '16px' }}>
        <Button variant="ghost" onClick={() => navigate('/employee/directory')}>
          <ArrowLeft size={16} />
          Back to Directory
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <>
          <div className={styles.profileZone}>
            <div className={styles.profileLeft}>
              <div className={styles.skeletonCard} style={{ height: '300px' }} />
              <div className={styles.skeletonCard} style={{ height: '200px' }} />
            </div>
            <div className={styles.profileRight}>
              <div className={styles.skeletonCard} style={{ height: '200px' }} />
              <div className={styles.skeletonCard} style={{ height: '300px' }} />
            </div>
          </div>
          <div className={styles.detailsZone}>
            <div className={styles.detailsLeft}>
              <div className={styles.skeletonCard} style={{ height: '280px' }} />
            </div>
            <div className={styles.detailsRight}>
              <div className={styles.skeletonCard} style={{ height: '320px' }} />
            </div>
          </div>
        </>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className={styles.errorState}>
          <h3>Employee not found</h3>
          <p>We couldn't load the profile for this employee.</p>
          <Button variant="secondary" onClick={() => navigate('/employee/directory')}>
            Go to Directory
          </Button>
        </div>
      )}

      {/* Main content */}
      {employee && !isLoading && (
        <>
          <EmployeeDetailPageHeader
            employee={employee}
            onOffboardClick={offboardingStatus ? undefined : () => setConfirmModalOpen(true)}
          />

          {offboardingStatus ? (
            <OffboardedEmployeeProfile
              employee={employee}
              offboardingStatus={offboardingStatus}
              employeeExited={isExited}
            />
          ) : (
            <>
              {/* ── Zone 1: Profile & Attendance (50/50) ── */}
              <div className={styles.profileZone}>
                <div className={styles.profileLeft}>
                  <EmployeeDetailHeader employee={employee} />
                  <HoursLoggedMockCard employeeId={employee.id} />
                </div>
                <div className={styles.profileRight}>
                  <LeaveBalanceCard employeeId={employee.id} />
                  <AttendanceCalendarMockCard employeeId={employee.id} />
                </div>
              </div>

              {/* ── Zone 2: Details (60/40) ── */}
              <div className={styles.detailsZone}>
                <div className={styles.detailsLeft}>
                  <EducationCard education={employee.education} />
                  <ExperienceCard experience={employee.experience} />
                  <DocumentsCard documents={employee.documents} />
                  <AssetsCard assets={employee.assets} />
                </div>
                <div className={styles.detailsRight}>
                  <PersonalInfoCard employee={employee} />
                  <PayrollSummaryCard employee={employee} />
                </div>
              </div>
            </>
          )}

          {/* Modals */}
          <InitiateOffboardingModal
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onProceed={(isImmediate) => {
              setEffectiveImmediately(isImmediate);
              setConfirmModalOpen(false);
              setCaptureModalOpen(true);
            }}
          />

          <OffboardingCaptureFlow
            employee={employee}
            isOpen={isCaptureModalOpen}
            onClose={() => setCaptureModalOpen(false)}
            effectiveImmediately={effectiveImmediately}
          />
        </>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
