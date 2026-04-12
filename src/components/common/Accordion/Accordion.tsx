import React, { useState, useRef, type ReactNode, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import styles from './Accordion.module.scss';

export interface AccordionProps {
  title: string | ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  iconWrapperStyle?: React.CSSProperties;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  icon,
  badge,
  defaultExpanded = false,
  children,
  className = '',
  iconWrapperStyle,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultExpanded ? undefined : 0,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
        // After transition time, set to undefined to auto-adjust when content changes
        const timeout = setTimeout(() => setContentHeight(undefined), 300);
        return () => clearTimeout(timeout);
      }
    } else {
      setContentHeight(0);
    }
  }, [isExpanded]);

  const toggleAccordion = () => {
    if (!isExpanded && contentRef.current) {
      // Small trick to ensure height animation triggers correctly when opening
      setContentHeight(0);
      requestAnimationFrame(() => {
        setContentHeight(contentRef.current?.scrollHeight);
      });
    } else if (isExpanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        setContentHeight(0);
      });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.accordion} ${isExpanded ? styles.expanded : ''} ${className}`}>
      <div className={styles.header} onClick={toggleAccordion}>
        <div className={styles.headerLeft}>
          {icon && (
            <div className={styles.iconWrapper} style={iconWrapperStyle}>
              {icon}
            </div>
          )}
          <div className={styles.titleInfo}>
            <span className={styles.title}>{title}</span>
            {badge && <span className={styles.badge}>{badge}</span>}
          </div>
        </div>
        <div className={styles.headerRight}>
          <ChevronDown
            className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
            size={20}
          />
        </div>
      </div>
      <div
        className={`${styles.contentWrapper} ${isExpanded && contentHeight === undefined ? styles.overflowVisible : ''}`}
        style={{ height: contentHeight !== undefined ? `${contentHeight}px` : 'auto' }}
      >
        <div className={styles.content} ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
};
