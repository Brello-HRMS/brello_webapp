import React from 'react';
import { Download, MoreVertical } from 'lucide-react';

import styles from './EmployeeProfilePage.module.scss';

const ATTENDANCE_LOG = [
  {
    date: '24 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    totalHours: '8h 30m',
    status: 'Present',
    notes: 'Regular shift',
  },
  {
    date: '23 Oct, 2025',
    checkIn: '09:15 AM',
    checkOut: '06:00 PM',
    totalHours: '8h 45m',
    status: 'Late',
    notes: 'Traffic',
  },
  {
    date: '22 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    totalHours: '8h 00m',
    status: 'Present',
    notes: '-',
  },
  {
    date: '21 Oct, 2025',
    checkIn: '-',
    checkOut: '-',
    totalHours: '0h 00m',
    status: 'Absent',
    notes: 'Sick leave',
  },
  {
    date: '20 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    totalHours: '8h 00m',
    status: 'Present',
    notes: '-',
  },
];

const EmployeeProfilePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        {/* Left Card: Profile Info */}
        <div className={styles.profileCard}>
          <img src="https://i.pravatar.cc/150?u=john" alt="John Doe" className={styles.avatar} />
          <h2>John Doe</h2>
          <p className={styles.role}>Senior Product Designer</p>
          <span className={styles.badge}>Active</span>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Employee ID</span>
              <span className={styles.value}>EMP-2024-001</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Joined</span>
              <span className={styles.value}>March 15, 2021</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Department</span>
              <span className={styles.value}>Product Design</span>
            </div>
          </div>
        </div>

        {/* Right Section: Stats & Charts */}
        <div className={styles.dashboardSection}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <p className={styles.label}>Total Working Days</p>
              <p className={styles.value}>23</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.label}>Late Arrivals</p>
              <p className={styles.value}>1</p>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3>Attendance Overview - Oct 2025</h3>
              <div className={styles.donutWrapper}>
                <div className={styles.chart}></div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={styles.nameRow}>
                    <div className={styles.dot} style={{ background: '#10B981' }}></div>
                    <span className={styles.label}>Present</span>
                  </div>
                  <span className={styles.value}>20</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.nameRow}>
                    <div className={styles.dot} style={{ background: '#EF4444' }}></div>
                    <span className={styles.label}>Absent</span>
                  </div>
                  <span className={styles.value}>2</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.nameRow}>
                    <div className={styles.dot} style={{ background: '#F59E0B' }}></div>
                    <span className={styles.label}>Late</span>
                  </div>
                  <span className={styles.value}>1</span>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>Working Hours (Last 7 Days)</h3>
              <div className={styles.lineChartPlaceholder}>
                <div className={styles.bar} style={{ height: '80%' }} data-label="Mon"></div>
                <div className={styles.bar} style={{ height: '85%' }} data-label="Tue"></div>
                <div className={styles.bar} style={{ height: '70%' }} data-label="Wed"></div>
                <div className={styles.bar} style={{ height: '90%' }} data-label="Thu"></div>
                <div className={styles.bar} style={{ height: '82%' }} data-label="Fri"></div>
                <div className={styles.bar} style={{ height: '0%' }} data-label="Sat"></div>
                <div className={styles.bar} style={{ height: '0%' }} data-label="Sun"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2>Attendance Log</h2>
          <button className={styles.exportBtn}>
            <Download size={18} />
            Export attendance
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total hours</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_LOG.map((log, index) => (
                <tr key={index}>
                  <td>{log.date}</td>
                  <td>{log.checkIn}</td>
                  <td>{log.checkOut}</td>
                  <td>{log.totalHours}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${log.status === 'Present' ? styles.present : log.status === 'Late' ? styles.late : styles.absent}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>{log.notes}</td>
                  <td>
                    <button className={styles.iconBtn}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployeeProfilePage;
