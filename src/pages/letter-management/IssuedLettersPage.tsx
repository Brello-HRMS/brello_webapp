import { useCallback, useMemo, useState } from 'react';
import { Plus, Send } from 'lucide-react';

import {
  Button,
  ListControls,
  NoDataFound,
  PageHeader,
  PermissionGate,
} from '../../components/common';
import { getIssuedLetterDownloadUrl } from '../../features/letter-management/api/issuedLetter';
import { GenerateLetterDrawer } from '../../features/letter-management/components/GenerateLetterDrawer/GenerateLetterDrawer';
import { IssuedLetterCard } from '../../features/letter-management/components/IssuedLetterCard/IssuedLetterCard';
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

import type { IssuedLetter } from '../../features/letter-management/types/letterTypes';

const IssuedLettersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewingLetter, setPreviewingLetter] = useState<IssuedLetter | null>(null);

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
    letter_number: debouncedSearchQuery || undefined,
    category_id: selectedCategoryId || undefined,
  });
  const { mutate: downloadLetter } = useIssuedLetterDownload();

  const letterList = useMemo(() => response?.data || [], [response]);

  const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const handleDownload = useCallback(
    (letter: IssuedLetter) => {
      downloadLetter(letter.id);
    },
    [downloadLetter],
  );

  const handleClosePreview = useCallback(() => setPreviewingLetter(null), []);

  if (!isLoading && letterList.length === 0 && !debouncedSearchQuery && !selectedCategoryId) {
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

      <ListControls
        showSearch
        showFilters={categoryFilterOptions.length > 0}
        showSort={false}
        showViewSwitcher={false}
        showMultiSelect={false}
        searchPlaceholder="Search by letter number..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={categoryFilterOptions}
        filterCount={selectedCategoryId ? 1 : 0}
        filterTitle="Category"
        selectedFilter={selectedCategoryId}
        onFilterChange={setSelectedCategoryId}
      />

      {letterList.length === 0 ? (
        <NoDataFound
          title="No Letters Found"
          description="We couldn't find any letter matching your current search or filter."
        />
      ) : (
        <div className={styles.grid}>
          {letterList.map((letter) => (
            <IssuedLetterCard
              key={letter.id}
              letter={letter}
              employeeName={employeeNameById[letter.employee_id] || '—'}
              categoryName={categoryNameById[letter.category_id] || '—'}
              onDownload={() => handleDownload(letter)}
              onPreview={() => setPreviewingLetter(letter)}
            />
          ))}
        </div>
      )}

      <GenerateLetterDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />

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
