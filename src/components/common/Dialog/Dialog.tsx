import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import styles from './Dialog.module.scss';

export interface DialogProps {
  title: React.ReactNode;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  position?: 'center' | 'right';
  showCloseButton?: boolean;
  headerAddon?: React.ReactNode;
  contentClassName?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  description,
  open,
  onClose,
  children,
  actions,
  maxWidth = '500px',
  position = 'center',
  showCloseButton = true,
  headerAddon,
  contentClassName,
}) => {
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setCustomWidth(Math.max(400, Math.min(newWidth, window.innerWidth - 40)));
    };
    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const dialogVariants = {
    hidden: position === 'right' ? { x: '100%', opacity: 0 } : { y: 15, opacity: 0, scale: 0.95 },
    visible: position === 'right' ? { x: 0, opacity: 1 } : { y: 0, opacity: 1, scale: 1 },
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`${styles.overlay} ${position === 'right' ? styles.overlayRight : ''}`}
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`${styles.dialog} ${position === 'right' ? styles.dialogRight : ''}`}
            style={{
              maxWidth: customWidth ? `${customWidth}px` : maxWidth,
              width: customWidth ? `${customWidth}px` : '100%',
              transition: isDragging ? 'none' : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {position === 'right' && (
              <div className={styles.dragHandle} onMouseDown={handleDragStart} />
            )}
            <div className={styles.header}>
              <div className={styles.headerMain}>
                <div className={styles.titleGroup}>
                  {typeof title === 'string' ? <h2>{title}</h2> : title}
                  {description && <p className={styles.description}>{description}</p>}
                </div>
                <div className={styles.headerActions}>
                  {showCloseButton && (
                    <button className={styles.iconButton} onClick={onClose} aria-label="Close">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
              {headerAddon && <div className={styles.headerAddon}>{headerAddon}</div>}
            </div>
            <div className={`${styles.content} ${contentClassName ?? ''}`}>{children}</div>
            {actions && <div className={styles.footer}>{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Dialog;
