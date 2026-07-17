import { ArrowUp } from 'lucide-react';

import { PageHeader } from '../../components/common';
import { HierarchyView } from '../../features/company-structure/components/HierarchyView/HierarchyView';
import { PersonCard } from '../../features/company-structure/components/PersonCard/PersonCard';
import { useMyHierarchy } from '../../features/company-structure/hooks/useMyHierarchy';

import styles from './MyTeamPage.module.scss';

const MyTeamPage = () => {
  const { data, isLoading } = useMyHierarchy();

  const self = data?.self;
  // Managers come back direct-first; show them top-of-chain first.
  const reportingLine = data ? [...data.managers].reverse() : [];
  const roots = self ? [self] : [];

  return (
    <div className={styles.page}>
      <PageHeader
        title="My Team"
        subtitle="Your reporting line and the people who report to you."
      />

      {reportingLine.length > 0 && (
        <section className={styles.reportingLine}>
          <span className={styles.reportingLabel}>
            <ArrowUp size={14} />
            Reporting line
          </span>
          <div className={styles.chain}>
            {reportingLine.map((manager) => (
              <PersonCard key={manager.id} node={manager} compact />
            ))}
          </div>
        </section>
      )}

      <HierarchyView
        roots={roots}
        isLoading={isLoading}
        emptyTitle="Nothing to show yet"
        emptyDescription="Your team hierarchy will appear here once it's set up."
      />
    </div>
  );
};

export default MyTeamPage;
