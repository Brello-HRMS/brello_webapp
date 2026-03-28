import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import styles from './Dialog.module.scss';

export interface DialogProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  position?: 'center' | 'right';
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
}) => {
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
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <h2>{title}</h2>
                {description && <p className={styles.description}>{description}</p>}
              </div>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className={styles.content}>{children}</div>
            {actions && <div className={styles.footer}>{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Dialog;
