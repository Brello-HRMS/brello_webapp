import React, { useState } from 'react';
import { Code, Tv, Users, Gamepad2, Headphones, Layers, FileText, Banknote } from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';

import styles from './AddDepartmentModal.module.scss';

interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
}

const icons = [
  { id: 'code', component: <Code size={20} /> },
  { id: 'tv', component: <Tv size={20} /> },
  { id: 'users', component: <Users size={20} /> },
  { id: 'gamepad', component: <Gamepad2 size={20} /> },
  { id: 'headphones', component: <Headphones size={20} /> },
  { id: 'layers', component: <Layers size={20} /> },
  { id: 'file', component: <FileText size={20} /> },
  { id: 'banknote', component: <Banknote size={20} /> },
];

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ open, onClose }) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const actions = (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onClose} type="button" className={styles.cancelAction}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onClose} type="submit" className={styles.saveAction}>
        Create department
      </Button>
    </div>
  );

  return (
    <Dialog
      title="Add New Department"
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form
        className={styles.formContainer}
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className={styles.formGroup}>
          <Input
            label="Department Name*"
            required
            placeholder="e.g., Finance"
            name="department_name"
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Department Code*"
            required
            placeholder="e.g., FIN-001"
            name="department_code"
          />
        </div>

        <div className={styles.statusRow}>
          <div>
            <label className={styles.statusLabel}>Status</label>
            <span className={styles.statusSubLabel}>Set the initial visibility state</span>
          </div>
          <div className={styles.toggleContainer}>
            <span className={styles.activeText}>Active</span>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.iconLabel}>
            Department Icon<span className={styles.required}>*</span>
          </label>
          <div className={styles.iconGrid}>
            {icons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                className={`${styles.iconButton} ${selectedIcon === icon.id ? styles.selected : ''}`}
                onClick={() => setSelectedIcon(icon.id)}
              >
                {icon.component}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
