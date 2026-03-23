import React, { useState } from 'react';
import { History, MoreVertical, Edit2, Trash2 } from 'lucide-react';

import { Popover } from '../../../../components/common';

import styles from './PolicyAccordionItem.module.scss';

import type { Policy } from '../../types/policyType';

interface PolicyAccordionItemProps {
  policy: Policy;
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
}

export const PolicyAccordionItem: React.FC<PolicyAccordionItemProps> = ({
  policy,
  onEdit,
  onDelete,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const menuItems = [
    {
      icon: <Edit2 size={16} />,
      title: 'Edit',
      action: () => {
        onEdit?.(policy);
        setIsPopoverOpen(false);
      },
    },
    {
      icon: <Trash2 size={16} />,
      title: 'Delete',
      action: () => {
        onDelete?.(policy);
        setIsPopoverOpen(false);
      },
      className: styles.danger,
    },
  ];

  return (
    <div className={styles.policyItem}>
      <div className={styles.mainContent}>
        <h4 className={styles.title}>{policy.title}</h4>
        <p className={styles.description}>{policy.description}</p>
      </div>

      <div className={styles.metaAction}>
        <div className={styles.metaData}>
          <History size={16} />
          <span>
            Last updated:{' '}
            {policy.updated_at
              ? new Date(policy.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A'}
          </span>
        </div>

        <Popover
          isOpen={isPopoverOpen}
          setIsOpen={setIsPopoverOpen}
          trigger={
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(!isPopoverOpen);
              }}
            >
              <MoreVertical size={20} />
            </button>
          }
          items={menuItems}
        />
      </div>
    </div>
  );
};
