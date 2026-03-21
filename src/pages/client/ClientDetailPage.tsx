import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import no_client from '../../assets/svg/department/no_department_found.svg';
import { Button, DataTable, NoDataFound, ListControls } from '../../components/common';
import { useClient } from '../../features/client/hooks/useClient';
import { useProjects } from '../../features/project/hooks/useProjects';
import { projectColumns } from '../../features/project/columns/projectColumns';
import { useDebounce } from '../../hooks/useDebounce';
import { AddProjectModal } from '../../features/project/components/AddProjectModal';

import styles from './ClientDetailPage.module.scss';

import type { Project, ProjectStatus } from '../../features/project/types/projectType';

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
];

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    return {
      status: selectedStatus === 'ALL' ? undefined : (selectedStatus as ProjectStatus),
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedStatus, pagination, debouncedSearchQuery]);

  const { data: client, isLoading: isClientLoading } = useClient(id || '');
  const { data: projectsResponse } = useProjects(id || '', queryParams);

  const projects = useMemo(() => projectsResponse?.data?.data || [], [projectsResponse]);
  const projectCount = projectsResponse?.data?.meta?.total || 0;

  const handleViewProject = useCallback((_project: Project) => {}, []);

  const handleEditProject = useCallback((_project: Project) => {}, []);

  const handleDeleteProject = useCallback((_project: Project) => {}, []);

  const columns = useMemo(
    () =>
      projectColumns({
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteProject,
      }),
    [handleViewProject, handleEditProject, handleDeleteProject],
  );

  if (isClientLoading) {
    return <div className={styles.container}>Loading client...</div>;
  }

  if (!client) {
    return (
      <NoDataFound
        title="Client Not Found"
        description="The client you are looking for does not exist or has been removed."
        noDataImage={no_client}
        noDataImageAlt="Client Not Found"
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Client Info Card */}
      <div className={styles.clientInfoCard}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            {client.logo_url ? (
              <img src={client.logo_url} alt={client?.name} />
            ) : (
              <div className={styles.placeholderLogo}>{client?.name?.charAt(0)}</div>
            )}
          </div>
          <div className={styles.titleInfo}>
            <div className={styles.nameRow}>
              <h2>{client.name}</h2>
              <span className={`${styles.statusBadge} ${styles.active}`}>{client.status}</span>
            </div>
            <div className={styles.addedOn}>
              Added on{' '}
              {new Date(client.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.label}>POC</span>
            <span className={styles.value}>{client.poc_name}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{client.poc_email}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Phone</span>
            <span className={styles.value}>{client.poc_phone}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Address</span>
            <span className={styles.value}>{client.address}</span>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleInfo}>
            <h3>Projects</h3>
            <span className={styles.countBadge}>{projectCount} total</span>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add project
          </Button>
        </div>
        <p className={styles.sectionSubtitle}>View and manage projects under this client</p>

        <ListControls
          searchPlaceholder="Search projects..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showViewSwitcher={false}
          showSort={false}
          filterOptions={STATUS_OPTIONS}
          selectedFilter={selectedStatus}
          onFilterChange={setSelectedStatus}
          filterTitle="Status"
          className={styles.listControls}
        />

        <DataTable
          columns={columns}
          data={projects}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={true}
          pageCount={projectsResponse?.data?.meta?.totalPages || 0}
          enableRowSelection={false}
          rowIdField="id"
        />
      </div>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clientId={id || ''}
      />
    </div>
  );
};

export default ClientDetailPage;
