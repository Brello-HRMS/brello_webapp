import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '../../../components/common';
import { useEmployeeDetail } from '../../../features/employee/hooks/useEmployeeDetail';
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
import { LeaveMockCard } from '../../../features/employee/components/EmployeeDetail/LeaveMockCard/LeaveMockCard';
import {
  HoursLoggedMockCard,
  AttendanceCalendarMockCard,
} from '../../../features/employee/components/EmployeeDetail/AttendanceMockCard/AttendanceMockCard';

import styles from './EmployeeProfilePage.module.scss';

const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useEmployeeDetail(id);

  const employee = response?.data;

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
          <EmployeeDetailPageHeader employee={employee} />

          {/* ── Zone 1: Profile & Attendance (50/50) ── */}
          <div className={styles.profileZone}>
            <div className={styles.profileLeft}>
              <EmployeeDetailHeader employee={employee} />
              <HoursLoggedMockCard />
            </div>
            <div className={styles.profileRight}>
              <LeaveMockCard />
              <AttendanceCalendarMockCard />
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
    </div>
  );
};

export default EmployeeProfilePage;
