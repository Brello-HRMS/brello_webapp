import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import no_client from '../../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  ExcelExport,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
} from '../../components/common';
import { clientColumns } from '../../features/client/columns/clientColumns';
import { useDeleteClient } from '../../features/client/hooks/useDeleteClient';
import { useClients } from '../../features/client/hooks/useClients';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';
import { AddClientModal } from '../../features/client/components/AddClientModal/AddClientModal';

import styles from './ClientPage.module.scss';

import type { SortOption, ViewType } from '../../components/common';
import type { Client } from '../../features/client/types/clientType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: Status.ACTIVE },
  { label: 'Inactive', value: Status.INACTIVE },
];

const ClientPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('table');
  const [selectedSort, setSelectedSort] = useState(`name:${SortOrder.ASC}`);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal states
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [_logoFile, _setLogoFile] = useState<File | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // Multi-select state
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const { mutate: deleteClient } = useDeleteClient();

  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':');
    return {
      status: selectedStatus === 'ALL' ? undefined : (selectedStatus as Status),
      sort_by: sortBy,
      sort_order: sortOrder as SortOrder,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedSort, selectedStatus, pagination, debouncedSearchQuery]);

  const { data: response, isLoading } = useClients(queryParams);

  const clientList = useMemo(() => response?.data?.data || [], [response]);

  const handleAddClient = useCallback(() => {
    setEditingClient(null);
    setIsAddClientOpen(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    setIsAddClientOpen(true);
  }, []);

  const handleDeleteClick = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowDeleteClientModal(true);
  }, []);

  const handleDeleteClient = useCallback(() => {
    if (selectedClient) {
      deleteClient(selectedClient.id, {
        onSuccess: () => {
          setShowDeleteClientModal(false);
          setSelectedClient(null);
        },
      });
    }
  }, [selectedClient, deleteClient]);

  const excelExportData = useMemo(() => {
    const dataToExport = isMultiSelectActive
      ? clientList.filter((client) => selectedIds[client.id])
      : clientList;

    return dataToExport.map((client) => ({
      Name: client.name,
      POC: client.poc_name,
      Email: client.poc_email,
      Phone: client.poc_phone,
      Address: client.address,
      Status: client.status,
    }));
  }, [clientList, isMultiSelectActive, selectedIds]);

  const handleView = useCallback(
    (client: Client) => {
      navigate(`/project/clients/${client.id}`);
    },
    [navigate],
  );

  // Main empty state
  if (!isLoading && clientList.length === 0 && !debouncedSearchQuery && selectedStatus === 'ALL') {
    return (
      <>
        <NoDataFound
          title="No Clients Added Yet"
          description="Create your first client to start organizing projects, contacts, and business relationships."
          noDataImage={no_client}
          noDataImageAlt="No Client Found"
          buttonText="Add new client"
          onButtonClick={handleAddClient}
          showButtonIcon
        />
        <AddClientModal
          open={isAddClientOpen}
          onClose={() => {
            setIsAddClientOpen(false);
            setEditingClient(null);
          }}
          client={editingClient}
        />
      </>
    );
  }

  return (
    <div className={` ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Client Management"
        subtitle="Manage client information linked to projects."
        actions={
          <>
            <ExcelExport
              data={excelExportData}
              filename="clients.xlsx"
              sheetName="Clients"
              buttonText={
                isMultiSelectActive
                  ? `Export Selected (${Object.values(selectedIds).filter(Boolean).length})`
                  : 'Export All'
              }
              variant="secondary"
              disabled={
                isMultiSelectActive && Object.values(selectedIds).filter(Boolean).length === 0
              }
            />
            <Button
              variant="primary"
              onClick={handleAddClient}
              disabled={isMultiSelectActive}
              title={isMultiSelectActive ? 'Disable multi-select to add client' : undefined}
            >
              <Plus size={16} />
              Add client
            </Button>
          </>
        }
      />

      <ListControls
        searchPlaceholder="Search client..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewType={viewType}
        showViewSwitcher={false}
        onViewTypeChange={setViewType}
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        filterOptions={STATUS_OPTIONS}
        selectedFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
        filterTitle="Filters"
        showMultiSelect={true}
        isMultiSelectActive={isMultiSelectActive}
        onMultiSelectToggle={() => {
          setIsMultiSelectActive(!isMultiSelectActive);
          if (isMultiSelectActive) {
            setSelectedIds({});
          }
        }}
      />

      <DataTable
        columns={clientColumns({
          isMultiSelectActive,
          onView: handleView,
          onEdit: handleEditClient,
          onDelete: handleDeleteClick,
        })}
        data={clientList}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
        pageCount={response?.data?.meta?.totalPages || 0}
        enableRowSelection={isMultiSelectActive}
        rowSelection={selectedIds}
        onRowSelectionChange={setSelectedIds}
        rowIdField="id"
      />

      <WarningModal
        isOpen={showDeleteClientModal}
        onClose={() => setShowDeleteClientModal(false)}
        title="Delete Client?"
        description={`Are you sure you want to delete the ${selectedClient?.name} client? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleDeleteClient}
      />

      <AddClientModal
        open={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />
    </div>
  );
};

export default ClientPage;
