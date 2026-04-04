import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import no_client from '../../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  NoDataFound,
  ListControls,
  WarningModal,
} from '../../components/common';
import { useClient } from '../../features/client/hooks/useClient';
import { useProjects } from '../../features/project/hooks/useProjects';
import { projectColumns } from '../../features/project/columns/projectColumns';
import { useDebounce } from '../../hooks/useDebounce';
import { AddProjectModal } from '../../features/project/components/AddProjectModal';
import { useDeleteProject } from '../../features/project/hooks/useDeleteProject';

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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

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

  const handleViewProject = useCallback(
    (project: Project) => {
      navigate(`/project/clients/${id}/projects/${project.id}`);
    },
    [navigate, id],
  );

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setIsAddModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingProject(undefined);
  }, []);

  const handleDeleteClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedProject) {
      deleteProject(selectedProject.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedProject(null);
        },
      });
    }
  }, [selectedProject, deleteProject]);

  const columns = useMemo(
    () =>
      projectColumns({
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteClick,
      }),
    [handleViewProject, handleEditProject, handleDeleteClick],
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
        <div className={styles.pocSidebar}>
          <span className={styles.pocLabel}>POC</span>
          <div className={styles.pocImageContainer}>
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.poc_name} className={styles.pocImage} />
            ) : (
              <div className={styles.pocPlaceholder}>{client.poc_name?.charAt(0) || 'P'}</div>
            )}
          </div>
          <h4 className={styles.pocName}>{client.poc_name}</h4>
          <div className={styles.pocContact}>
            <div className={styles.contactItem} title="Phone">
              <span className={styles.contactIcon}>📞</span>
              <span>{client.poc_phone}</span>
            </div>
            <div className={styles.contactItem} title="Email">
              <span className={styles.contactIcon}>✉️</span>
              <span>{client.poc_email}</span>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.clientHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.clientLogo}>
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.name} />
                ) : (
                  <div className={styles.placeholderLogo}>{client.name.charAt(0)}</div>
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
          </div>

          <div className={styles.addressSection}>
            <div className={styles.addressIcon}>📍</div>
            <div className={styles.addressInfo}>
              <span className={styles.addressLabel}>Registered Address</span>
              <p className={styles.addressValue}>{client.address}</p>
            </div>
          </div>

          <div className={styles.statisticsSection}>
            <span className={styles.statsTitle}>Project Statistics</span>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.total}`}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue}>{String(projectCount).padStart(2, '0')}</span>
              </div>
              <div className={`${styles.statCard} ${styles.activeStats}`}>
                <span className={styles.statLabel}>Active</span>
                <span className={styles.statValue}>
                  {String(projects.filter((p) => p.project_status === 'ACTIVE').length).padStart(
                    2,
                    '0',
                  )}
                </span>
              </div>
              <div className={`${styles.statCard} ${styles.completedStats}`}>
                <span className={styles.statLabel}>Completed</span>
                <span className={styles.statValue}>
                  {String(projects.filter((p) => p.project_status === 'COMPLETED').length).padStart(
                    2,
                    '0',
                  )}
                </span>
              </div>
              <div className={`${styles.statCard} ${styles.onHoldStats}`}>
                <span className={styles.statLabel}>On Hold</span>
                <span className={styles.statValue}>
                  {String(projects.filter((p) => p.project_status === 'ON_HOLD').length).padStart(
                    2,
                    '0',
                  )}
                </span>
              </div>
            </div>
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
          <Button
            variant="primary"
            onClick={() => {
              setEditingProject(undefined);
              setIsAddModalOpen(true);
            }}
            disabled={isDeleting}
          >
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

      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project?"
        description={`Are you sure you want to delete the "${selectedProject?.name}" project? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleConfirmDelete}
      />

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        clientId={id || ''}
        project={editingProject}
      />
    </div>
  );
};

export default ClientDetailPage;
