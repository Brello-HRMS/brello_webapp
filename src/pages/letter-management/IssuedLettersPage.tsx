import { useCallback, useMemo, useState } from 'react';
import { Plus, Send } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  PermissionGate,
  Select,
} from '../../components/common';
import { employeeLetterColumns } from '../../features/letter-management/columns/employeeLetterColumns';
import { getIssuedLetterDownloadUrl } from '../../features/letter-management/api/issuedLetter';
import { EmployeeLettersDrawer } from '../../features/letter-management/components/EmployeeLettersDrawer/EmployeeLettersDrawer';
import { GenerateLetterDrawer } from '../../features/letter-management/components/GenerateLetterDrawer/GenerateLetterDrawer';
import { LetterPreviewModal } from '../../features/letter-management/components/LetterPreviewModal/LetterPreviewModal';
import { useLetterCategories } from '../../features/letter-management/hooks/useLetterCategories';
import {
  useEmployeeSearch,
  useIssuedLetterDownload,
  useIssuedLetters,
} from '../../features/letter-management/hooks/useIssuedLetters';
import { useDebounce } from '../../hooks/useDebounce';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { resolveAssetUrl } from '../../utils/assetUrl';

import styles from './IssuedLettersPage.module.scss';

import type { EmployeeLetterGroup } from '../../features/letter-management/columns/employeeLetterColumns';
import type {
  IssuedLetter,
  IssuedLetterDeliveryStatus,
} from '../../features/letter-management/types/letterTypes';

const DELIVERY_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Viewed', value: 'VIEWED' },
  { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
];

const IssuedLettersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewingLetter, setPreviewingLetter] = useState<IssuedLetter | null>(null);
  const [selectedEmployeeGroup, setSelectedEmployeeGroup] = useState<EmployeeLetterGroup | null>(
    null,
  );

  const { hasCreateAccess } = useModuleAccess(ModuleCode.LETTER_ISSUED);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: categoriesResponse } = useLetterCategories();
  const categoryList = useMemo(() => categoriesResponse?.data || [], [categoriesResponse]);
  const categoryNameById = useMemo(
    () => Object.fromEntries(categoryList.map((category) => [category.id, category.name])),
    [categoryList],
  );
  const categoryFilterOptions = useMemo(
    () => categoryList.map((category) => ({ label: category.name, value: category.id })),
    [categoryList],
  );

  const { data: employeesResponse } = useEmployeeSearch();
  const employeeNameById = useMemo(
    () =>
      Object.fromEntries(
        (employeesResponse?.data || []).map((employee) => [employee.id, employee.name]),
      ),
    [employeesResponse],
  );

  const { data: response, isLoading } = useIssuedLetters({
    category_id: selectedCategoryId || undefined,
    delivery_status: (selectedDeliveryStatus || undefined) as
      | IssuedLetterDeliveryStatus
      | undefined,
  });
  const { mutate: downloadLetter } = useIssuedLetterDownload();

  const letterList = useMemo(() => response?.data || [], [response]);

  const employeeGroups = useMemo<EmployeeLetterGroup[]>(() => {
    const byEmployee = new Map<string, IssuedLetter[]>();
    letterList.forEach((letter) => {
      const existing = byEmployee.get(letter.employee_id);
      if (existing) {
        existing.push(letter);
      } else {
        byEmployee.set(letter.employee_id, [letter]);
      }
    });

    return Array.from(byEmployee.entries())
      .map(([employeeId, letters]) => {
        const sortedLetters = [...letters].sort(
          (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime(),
        );
        return {
          employeeId,
          employeeName: employeeNameById[employeeId] || '—',
          letters: sortedLetters,
          latestLetter: sortedLetters[0],
        };
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [letterList, employeeNameById]);

  const filteredEmployeeGroups = useMemo(() => {
    if (!debouncedSearchQuery) return employeeGroups;
    const query = debouncedSearchQuery.toLowerCase();
    return employeeGroups.filter(
      (group) =>
        group.employeeName.toLowerCase().includes(query) ||
        group.letters.some((letter) => letter.letter_number.toLowerCase().includes(query)),
    );
  }, [employeeGroups, debouncedSearchQuery]);

  const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const handleDownload = useCallback(
    (letter: IssuedLetter) => {
      downloadLetter(letter.id);
    },
    [downloadLetter],
  );

  const handleClosePreview = useCallback(() => setPreviewingLetter(null), []);
  const handleCloseEmployeeLetters = useCallback(() => setSelectedEmployeeGroup(null), []);

  if (
    !isLoading &&
    letterList.length === 0 &&
    !debouncedSearchQuery &&
    !selectedCategoryId &&
    !selectedDeliveryStatus
  ) {
    return (
      <>
        <NoDataFound
          title="No Letters Issued Yet"
          description="No letters have been generated yet. Generate your first letter for an employee to get started."
          buttonText={hasCreateAccess ? 'Generate Your First Letter' : undefined}
          onButtonClick={hasCreateAccess ? handleOpenDrawer : undefined}
          showButtonIcon={hasCreateAccess}
        />
        <GenerateLetterDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
      </>
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Issued Letters"
        titleExtra={
          <span className={styles.pageIcon}>
            <Send size={20} />
          </span>
        }
        subtitle="View and manage letters that have been generated for employees."
        actions={
          <PermissionGate module={ModuleCode.LETTER_ISSUED} action={ActionCode.CREATE}>
            <Button variant="primary" onClick={handleOpenDrawer}>
              <Plus size={16} />
              Generate Letter
            </Button>
          </PermissionGate>
        }
      />

      <div className={styles.controlsRow}>
        <ListControls
          showSearch
          showFilters={categoryFilterOptions.length > 0}
          showSort={false}
          showViewSwitcher={false}
          showMultiSelect={false}
          searchPlaceholder="Search by employee name or letter number..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={categoryFilterOptions}
          filterCount={selectedCategoryId ? 1 : 0}
          filterTitle="Category"
          selectedFilter={selectedCategoryId}
          onFilterChange={setSelectedCategoryId}
        />
        <Select
          className={styles.statusFilter}
          options={DELIVERY_STATUS_OPTIONS}
          value={selectedDeliveryStatus}
          onChange={(value) => setSelectedDeliveryStatus(String(value))}
          labelPrefix="Status: "
        />
      </div>

      {filteredEmployeeGroups.length === 0 ? (
        <NoDataFound
          title="No Letters Found"
          description="We couldn't find any letter matching your current search or filter."
        />
      ) : (
        <DataTable
          columns={employeeLetterColumns({ onViewLetters: setSelectedEmployeeGroup })}
          data={filteredEmployeeGroups}
          rowIdField="employeeId"
        />
      )}

      <GenerateLetterDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />

      <EmployeeLettersDrawer
        isOpen={!!selectedEmployeeGroup}
        onClose={handleCloseEmployeeLetters}
        employeeName={selectedEmployeeGroup?.employeeName ?? ''}
        letters={selectedEmployeeGroup?.letters ?? []}
        categoryNameById={categoryNameById}
        onDownload={handleDownload}
        onPreview={setPreviewingLetter}
      />

      <LetterPreviewModal
        letterNumber={previewingLetter?.letter_number ?? ''}
        isOpen={!!previewingLetter}
        onClose={handleClosePreview}
        fetchUrl={async () => {
          const { data } = await getIssuedLetterDownloadUrl(previewingLetter!.id);
          return resolveAssetUrl(data.url) ?? data.url;
        }}
      />
    </div>
  );
};

export default IssuedLettersPage;
