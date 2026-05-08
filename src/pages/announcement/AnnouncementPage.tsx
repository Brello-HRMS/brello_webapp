import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { ListControls } from '../../components/common';
import { Button } from '../../components/common/Button/Button';
import { WarningModal } from '../../components/common/WarningModal/WarningModal';
import { useDebounce } from '../../hooks/useDebounce';
import {
  useAnnouncements,
  usePublishAnnouncement,
  useArchiveAnnouncement,
  useDeleteAnnouncement,
} from '../../features/announcement/hooks/useAnnouncement';
import { adminAnnouncementColumns } from '../../features/announcement/columns/adminAnnouncementColumns';
import { CreateAnnouncementModal } from '../../features/announcement/components/CreateAnnouncementModal/CreateAnnouncementModal';

import styles from './AnnouncementPage.module.scss';

import type { Announcement } from '../../features/announcement/types/announcementTypes';

const AnnouncementPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [publishTarget, setPublishTarget] = useState<Announcement | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch || undefined,
    }),
    [pagination, debouncedSearch],
  );

  const { items, isLoading, pagination: meta } = useAnnouncements(queryParams);
  const { publishAnnouncement, isPublishing } = usePublishAnnouncement();
  const { archiveAnnouncement, isArchiving } = useArchiveAnnouncement();
  const { deleteAnnouncement, isDeleting } = useDeleteAnnouncement();

  const handleCreate = useCallback(() => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((a: Announcement) => {
    setEditingAnnouncement(a);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  }, []);

  const handleConfirmPublish = useCallback(async () => {
    if (!publishTarget) return;
    await publishAnnouncement(publishTarget.id);
    setPublishTarget(null);
  }, [publishAnnouncement, publishTarget]);

  const handleConfirmArchive = useCallback(async () => {
    if (!archiveTarget) return;
    await archiveAnnouncement(archiveTarget.id);
    setArchiveTarget(null);
  }, [archiveAnnouncement, archiveTarget]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteAnnouncement(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteAnnouncement, deleteTarget]);

  const columns = useMemo(
    () =>
      adminAnnouncementColumns({
        onEdit: handleEdit,
        onPublishNow: setPublishTarget,
        onArchive: setArchiveTarget,
        onDelete: setDeleteTarget,
      }),
    [handleEdit],
  );

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Create and manage company-wide announcements."
        actions={
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={16} />
            New announcement
          </Button>
        }
      />
      <ListControls
        searchPlaceholder="Search announcements..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={false}
        showSort={false}
        showViewSwitcher={false}
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
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingAnnouncement={editingAnnouncement}
      />

      <WarningModal
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        title="Publish announcement?"
        description={`"${publishTarget?.title}" will be published immediately and sent to targeted employees.`}
        actionLabel={isPublishing ? 'Publishing...' : 'Publish'}
        onAction={handleConfirmPublish}
      />

      <WarningModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive announcement?"
        description={`"${archiveTarget?.title}" will be archived and hidden from employees.`}
        actionLabel={isArchiving ? 'Archiving...' : 'Archive'}
        onAction={handleConfirmArchive}
      />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete announcement?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        actionLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onAction={handleConfirmDelete}
      />
    </div>
  );
};

export default AnnouncementPage;
