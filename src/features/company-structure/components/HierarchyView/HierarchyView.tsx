import { useMemo, useState } from 'react';
import { Network, List, Search, Users } from 'lucide-react';

import { Loader } from '../../../../components/common/Loader/Loader';
import { NoDataFound } from '../../../../components/common';
import { useDebounce } from '../../../../hooks/useDebounce';
import { OrgTree } from '../OrgTree/OrgTree';
import { OrgList } from '../OrgList/OrgList';
import { PersonDetailPanel } from '../PersonDetailPanel/PersonDetailPanel';
import { buildIndex, countPeople, filterTree, getAncestors } from '../../utils/personUtils';

import styles from './HierarchyView.module.scss';

import type { HierarchyNode } from '../../types/hierarchyType';

type ViewMode = 'tree' | 'list';

interface HierarchyViewProps {
  roots: HierarchyNode[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const HierarchyView = ({
  roots,
  isLoading,
  emptyTitle = 'No hierarchy to show',
  emptyDescription = 'Once employees have reporting managers set, the company structure will appear here.',
}: HierarchyViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const index = useMemo(() => buildIndex(roots), [roots]);
  const filteredRoots = useMemo(() => filterTree(roots, debouncedSearch), [roots, debouncedSearch]);

  const selectedNode = selectedId ? (index.byId.get(selectedId) ?? null) : null;
  const selectedManagers = useMemo(
    () => (selectedNode ? getAncestors(selectedNode.id, index) : []),
    [selectedNode, index],
  );

  const totalPeople = useMemo(() => countPeople(roots), [roots]);

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Loader size="lg" />
      </div>
    );
  }

  if (!roots.length) {
    return <NoDataFound title={emptyTitle} description={emptyDescription} showButtonIcon={false} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search people, role, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.rightControls}>
          <span className={styles.count}>
            <Users size={14} />
            {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
          </span>

          <div className={styles.segmented} role="tablist" aria-label="View mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'tree'}
              className={[styles.segment, viewMode === 'tree' ? styles.segmentActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setViewMode('tree')}
            >
              <Network size={15} />
              Tree
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              className={[styles.segment, viewMode === 'list' ? styles.segmentActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setViewMode('list')}
            >
              <List size={15} />
              List
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.canvas}>
          {filteredRoots.length === 0 ? (
            <NoDataFound
              title="No matches"
              description={`No one matches "${debouncedSearch}".`}
              showButtonIcon={false}
            />
          ) : viewMode === 'tree' ? (
            <OrgTree
              nodes={filteredRoots}
              onSelect={(n) => setSelectedId(n.id)}
              selectedId={selectedId ?? undefined}
            />
          ) : (
            <OrgList
              nodes={filteredRoots}
              onSelect={(n) => setSelectedId(n.id)}
              selectedId={selectedId ?? undefined}
            />
          )}
        </div>

        {selectedNode && (
          <PersonDetailPanel
            node={selectedNode}
            managers={selectedManagers}
            onClose={() => setSelectedId(null)}
            onSelect={(n) => setSelectedId(n.id)}
          />
        )}
      </div>
    </div>
  );
};
