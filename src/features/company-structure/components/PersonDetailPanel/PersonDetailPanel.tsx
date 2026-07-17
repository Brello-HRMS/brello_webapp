import { Mail, Phone, Users, X, ChevronRight } from 'lucide-react';

import { PersonCard } from '../PersonCard/PersonCard';
import { getAvatarColor, getInitials } from '../../utils/personUtils';

import styles from './PersonDetailPanel.module.scss';

import type { HierarchyNode } from '../../types/hierarchyType';

interface PersonDetailPanelProps {
  node: HierarchyNode;
  /** Manager chain, direct manager first → top last. */
  managers: HierarchyNode[];
  onClose: () => void;
  onSelect: (node: HierarchyNode) => void;
}

export const PersonDetailPanel = ({
  node,
  managers,
  onClose,
  onSelect,
}: PersonDetailPanelProps) => {
  const reportingLine = [...managers].reverse(); // top → direct manager

  return (
    <aside className={styles.panel}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
        <X size={18} />
      </button>

      <div className={styles.header}>
        {node.avatar ? (
          <img className={styles.avatar} src={node.avatar} alt={node.fullName} />
        ) : (
          <span
            className={styles.avatarFallback}
            style={{ backgroundColor: getAvatarColor(node.id) }}
          >
            {getInitials(node)}
          </span>
        )}
        <h3 className={styles.name}>{node.fullName}</h3>
        <p className={styles.role}>{node.designation ?? 'No designation'}</p>
        {node.department && <span className={styles.dept}>{node.department}</span>}
      </div>

      <div className={styles.contact}>
        <a className={styles.contactRow} href={`mailto:${node.email}`}>
          <Mail size={14} />
          <span>{node.email}</span>
        </a>
        {node.phone && (
          <a className={styles.contactRow} href={`tel:${node.phone}`}>
            <Phone size={14} />
            <span>{node.phone}</span>
          </a>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{node.directReportsCount}</span>
          <span className={styles.statLabel}>Direct reports</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{node.totalReportsCount}</span>
          <span className={styles.statLabel}>Total reportees</span>
        </div>
      </div>

      {reportingLine.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Reporting line</h4>
          <div className={styles.breadcrumb}>
            {reportingLine.map((m, i) => (
              <span key={m.id} className={styles.crumbWrap}>
                <button type="button" className={styles.crumb} onClick={() => onSelect(m)}>
                  {m.fullName}
                </button>
                {i < reportingLine.length && <ChevronRight size={12} />}
              </span>
            ))}
            <span className={styles.crumbCurrent}>{node.fullName}</span>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <Users size={14} />
          Direct reportees ({node.directReportsCount})
        </h4>
        {node.children.length > 0 ? (
          <div className={styles.reportees}>
            {node.children.map((child) => (
              <PersonCard key={child.id} node={child} compact onClick={onSelect} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No direct reportees.</p>
        )}
      </div>
    </aside>
  );
};
