import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { useEmployeeAnnouncements } from '../../features/announcement/hooks/useAnnouncement';
import { employeeAnnouncementColumns } from '../../features/announcement/columns/employeeAnnouncementColumns';
import { AnnouncementDetailDrawer } from '../../features/announcement/components/AnnouncementDetailDrawer/AnnouncementDetailDrawer';

import styles from './EmployeeAnnouncementPage.module.scss';

import type { EmployeeAnnouncement } from '../../features/announcement/types/announcementTypes';

const EmployeeAnnouncementPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<EmployeeAnnouncement | null>(
    null,
  );

  const queryParams = useMemo(
    () => ({ page: pagination.pageIndex + 1, limit: pagination.pageSize }),
    [pagination],
  );

  const { items, isLoading, pagination: meta } = useEmployeeAnnouncements(queryParams);

  const handleView = useCallback((a: EmployeeAnnouncement) => setSelectedAnnouncement(a), []);
  const handleCloseDrawer = useCallback(() => setSelectedAnnouncement(null), []);

  const columns = useMemo(() => employeeAnnouncementColumns({ onView: handleView }), [handleView]);

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Announcements"
        subtitle="Stay up to date with the latest company announcements."
      />

      {isLoading ? (
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={28} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          manualPagination
        />
      )}

      <AnnouncementDetailDrawer announcement={selectedAnnouncement} onClose={handleCloseDrawer} />
    </div>
  );
};

export default EmployeeAnnouncementPage;
