import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { PersonCard } from '../PersonCard/PersonCard';

import styles from './OrgTree.module.scss';

import type { HierarchyNode } from '../../types/hierarchyType';

interface OrgTreeProps {
  nodes: HierarchyNode[];
  onSelect?: (node: HierarchyNode) => void;
  selectedId?: string;
  /** Nodes deeper than this start collapsed. Default: expand top two levels. */
  defaultExpandedDepth?: number;
}

export const OrgTree = ({
  nodes,
  onSelect,
  selectedId,
  defaultExpandedDepth = 2,
}: OrgTreeProps) => {
  return (
    <div className={styles.scroll}>
      <ul className={styles.tree}>
        {nodes.map((node) => (
          <OrgTreeNode
            key={node.id}
            node={node}
            depth={0}
            defaultExpandedDepth={defaultExpandedDepth}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))}
      </ul>
    </div>
  );
};

interface OrgTreeNodeProps {
  node: HierarchyNode;
  depth: number;
  defaultExpandedDepth: number;
  onSelect?: (node: HierarchyNode) => void;
  selectedId?: string;
}

const OrgTreeNode = ({
  node,
  depth,
  defaultExpandedDepth,
  onSelect,
  selectedId,
}: OrgTreeNodeProps) => {
  const hasChildren = node.children.length > 0;
  const [open, setOpen] = useState(depth < defaultExpandedDepth);

  return (
    <li className={styles.node}>
      <div className={styles.nodeCard}>
        <PersonCard node={node} selected={selectedId === node.id} onClick={onSelect} />
        {hasChildren && (
          <button
            type="button"
            className={styles.expander}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse reportees' : 'Expand reportees'}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>{node.directReportsCount}</span>
          </button>
        )}
      </div>

      {hasChildren && open && (
        <ul className={styles.children}>
          {node.children.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              defaultExpandedDepth={defaultExpandedDepth}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
