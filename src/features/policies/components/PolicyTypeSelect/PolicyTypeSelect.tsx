import React, { useState, useRef, useEffect } from 'react';
import { Check, Plus, ChevronDown, Calendar, Users, Lock, Anchor, Pencil } from 'lucide-react';

import styles from './PolicyTypeSelect.module.scss';

import type { PolicyCategory } from '../../types/policyType';

interface PolicyTypeSelectProps {
  categories: PolicyCategory[];
  value: string;
  onChange: (value: string) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  placeholder?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  calendar: <Calendar size={14} />,
  users: <Users size={14} />,
  lock: <Lock size={14} />,
};

const ICON_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  calendar: { bg: '#eefcf5', color: '#16b364' },
  users: { bg: '#fdf4ec', color: '#e58728' },
  lock: { bg: '#f4f3ff', color: '#7a5af8' },
};

export const PolicyTypeSelect: React.FC<PolicyTypeSelectProps> = ({
  categories,
  value,
  onChange,
  onAddCategory,
  onRenameCategory,
  placeholder = 'Select policy type',
}) => {
  const [open, setOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find((c) => c.id === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingNew(false);
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (addingNew && newInputRef.current) newInputRef.current.focus();
  }, [addingNew]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const handleAddNew = () => {
    const trimmed = newTypeName.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setNewTypeName('');
    }
    setAddingNew(false);
  };

  const handleRename = (id: string) => {
    const trimmed = editingValue.trim();
    if (trimmed) onRenameCategory(id, trimmed);
    setEditingId(null);
  };

  const startEdit = (e: React.MouseEvent, cat: PolicyCategory) => {
    e.stopPropagation();
    setEditingId(cat.id);
    setEditingValue(cat.name);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.active : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {selectedCategory ? (
          <span className={styles.selectedItem}>
            <span
              className={styles.categoryIcon}
              style={{
                backgroundColor: ICON_COLOR_MAP[selectedCategory.iconName]?.bg || '#f4f3ff',
                color: ICON_COLOR_MAP[selectedCategory.iconName]?.color || '#7a5af8',
              }}
            >
              {ICON_MAP[selectedCategory.iconName] || <Anchor size={14} />}
            </span>
            {selectedCategory.name}
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <ChevronDown size={16} className={`${styles.chevron} ${open ? styles.rotated : ''}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.optionList}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`${styles.option} ${value === cat.id ? styles.selectedOption : ''}`}
                onClick={() => {
                  if (editingId === cat.id) return;
                  onChange(cat.id);
                  setOpen(false);
                }}
              >
                <span
                  className={styles.categoryIcon}
                  style={{
                    backgroundColor: ICON_COLOR_MAP[cat.iconName]?.bg || '#f4f3ff',
                    color: ICON_COLOR_MAP[cat.iconName]?.color || '#7a5af8',
                  }}
                >
                  {ICON_MAP[cat.iconName] || <Anchor size={14} />}
                </span>

                {editingId === cat.id ? (
                  <input
                    ref={editInputRef}
                    className={styles.editInput}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => handleRename(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(cat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                ) : (
                  <span className={styles.optionLabel}>{cat.name}</span>
                )}

                <span className={styles.optionActions}>
                  {value === cat.id && <Check size={14} className={styles.checkIcon} />}
                  <button
                    type="button"
                    className={styles.editBtn}
                    title="Double-click to rename"
                    onDoubleClick={(e) => startEdit(e, cat)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil size={12} />
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.addSection}>
            {addingNew ? (
              <div className={styles.addNew}>
                <Plus size={14} className={styles.addIcon} />
                <input
                  ref={newInputRef}
                  className={styles.newInput}
                  placeholder="Type a new category…"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onBlur={handleAddNew}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNew();
                    if (e.key === 'Escape') {
                      setAddingNew(false);
                      setNewTypeName('');
                    }
                  }}
                />
              </div>
            ) : (
              <button type="button" className={styles.addButton} onClick={() => setAddingNew(true)}>
                <Plus size={14} />
                Add new type
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyTypeSelect;
