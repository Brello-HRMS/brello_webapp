import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { PersonCard } from '../PersonCard/PersonCard';

import styles from './OrgList.module.scss';

import type { HierarchyNode } from '../../types/hierarchyType';

interface OrgListProps {
  nodes: HierarchyNode[];
  /** Nodes at these depths start expanded. Default: expand top two levels. */
  defaultExpandedDepth?: number;
  onSelect?: (node: HierarchyNode) => void;
  selectedId?: string;
}

export const OrgList = ({
  nodes,
  defaultExpandedDepth = 1,
  onSelect,
  selectedId,
}: OrgListProps) => {
  return (
    <div className={styles.list}>
      {nodes.map((node) => (
        <OrgListRow
          key={node.id}
          node={node}
          depth={0}
          defaultExpandedDepth={defaultExpandedDepth}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
};

interface OrgListRowProps {
  node: HierarchyNode;
  depth: number;
  defaultExpandedDepth: number;
  onSelect?: (node: HierarchyNode) => void;
  selectedId?: string;
}

const OrgListRow = ({
  node,
  depth,
  defaultExpandedDepth,
  onSelect,
  selectedId,
}: OrgListRowProps) => {
  const hasChildren = node.children.length > 0;
  const [open, setOpen] = useState(depth < defaultExpandedDepth);

  return (
    <div className={styles.rowGroup}>
      <div className={styles.row} style={{ paddingLeft: depth * 24 }}>
        <button
          type="button"
          className={[styles.toggle, hasChildren ? '' : styles.toggleHidden].join(' ')}
          onClick={() => hasChildren && setOpen((v) => !v)}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <ChevronRight
            size={16}
            className={[styles.chevron, open ? styles.chevronOpen : ''].join(' ')}
          />
        </button>
        <PersonCard node={node} compact selected={selectedId === node.id} onClick={onSelect} />
      </div>

      {hasChildren && open && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <OrgListRow
              key={child.id}
              node={child}
              depth={depth + 1}
              defaultExpandedDepth={defaultExpandedDepth}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
