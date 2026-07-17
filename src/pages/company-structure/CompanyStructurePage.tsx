import { PageHeader } from '../../components/common';
import { HierarchyView } from '../../features/company-structure/components/HierarchyView/HierarchyView';
import { useOrgTree } from '../../features/company-structure/hooks/useOrgTree';

import styles from './CompanyStructurePage.module.scss';

const CompanyStructurePage = () => {
  const { data, isLoading } = useOrgTree();
  const roots = data ?? [];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Company Structure"
        subtitle="Explore the reporting hierarchy across the organization and drill into any team."
      />
      <HierarchyView
        roots={roots}
        isLoading={isLoading}
        emptyTitle="No reporting structure yet"
        emptyDescription="Assign reporting managers to employees to build out the org chart."
      />
    </div>
  );
};

export default CompanyStructurePage;
