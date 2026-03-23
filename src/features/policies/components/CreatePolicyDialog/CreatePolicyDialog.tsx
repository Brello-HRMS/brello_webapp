import { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Strikethrough,
  Code,
  // Icon picker icons
  Code2,
  Megaphone,
  Users,
  Paintbrush,
  Headphones,
  TrendingUp,
  FileText,
  Banknote,
  ShieldCheck,
  Calendar,
  BookOpen,
  Globe,
} from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { PolicyTypeSelect } from '../PolicyTypeSelect/PolicyTypeSelect';
import { usePolicyTypes } from '../../hooks/usePolicyTypes';
import { useCreatePolicyType } from '../../hooks/useCreatePolicyType';
import { useUpdatePolicyType } from '../../hooks/useUpdatePolicyType';

import styles from './CreatePolicyDialog.module.scss';

import type { PolicyFormData } from '../../types/policyType';

interface CreatePolicyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (policy: PolicyFormData) => void;
}

// Icon picker — matches Figma "Policy icon" grid (icon + background color)
const POLICY_ICONS = [
  { id: 'code', icon: <Code2 size={18} />, bg: '#ede9fe', color: '#7c3aed' },
  { id: 'megaphone', icon: <Megaphone size={18} />, bg: '#dcfce7', color: '#16a34a' },
  { id: 'users', icon: <Users size={18} />, bg: '#ffedd5', color: '#ea580c' },
  { id: 'brush', icon: <Paintbrush size={18} />, bg: '#ede9fe', color: '#7c3aed' },
  { id: 'headphone', icon: <Headphones size={18} />, bg: '#fee2e2', color: '#dc2626' },
  { id: 'trending', icon: <TrendingUp size={18} />, bg: '#fef9c3', color: '#ca8a04' },
  { id: 'file', icon: <FileText size={18} />, bg: '#dbeafe', color: '#2563eb' },
  { id: 'banknote', icon: <Banknote size={18} />, bg: '#fee2e2', color: '#dc2626' },
  { id: 'shield', icon: <ShieldCheck size={18} />, bg: '#dcfce7', color: '#16a34a' },
  { id: 'calendar', icon: <Calendar size={18} />, bg: '#e0f2fe', color: '#0284c7' },
  { id: 'book', icon: <BookOpen size={18} />, bg: '#fce7f3', color: '#db2777' },
  { id: 'globe', icon: <Globe size={18} />, bg: '#dbeafe', color: '#2563eb' },
];

const initialForm: PolicyFormData = {
  title: '',
  description: '',
  policyType: '',
  sortBy: '',
  iconColor: POLICY_ICONS[0].id,
  content: '',
};

export const CreatePolicyDialog: React.FC<CreatePolicyDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<PolicyFormData>(initialForm);
  const editorRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setStep(1);
    setFormData(initialForm);
  };

  const { data: policyTypes = [] } = usePolicyTypes();
  const { mutate: createPolicyType } = useCreatePolicyType();
  const { mutate: updatePolicyTypeMutation } = useUpdatePolicyType();

  // Map PolicyType[] to the shape PolicyTypeSelect expects
  const categoriesForSelect = policyTypes.map((pt) => ({
    id: pt.id,
    name: pt.name,
    iconName: pt.icon, // API field 'icon' used as iconName
  }));

  const handleField = (field: keyof PolicyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = (name: string) => {
    createPolicyType(
      { name, icon: 'description', status: 'ACTIVE' },
      {
        onSuccess: (newType) => {
          handleField('policyType', newType.id);
        },
      },
    );
  };

  const handleRenameCategory = (id: string, newName: string) => {
    updatePolicyTypeMutation({ id, params: { name: newName } });
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSaveAndPublish = () => {
    const content = editorRef.current?.innerHTML || '';
    onSuccess({ ...formData, content });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Actions = (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={handleClose} type="button">
        Cancel
      </Button>
      <Button
        variant="primary"
        type="button"
        onClick={() => setStep(2)}
        disabled={!formData.title || !formData.policyType}
      >
        Continue to content
      </Button>
    </div>
  );

  const step2Actions = (
    <div className={styles.actions}>
      <Button variant="secondary" type="button" onClick={() => setStep(1)}>
        Back
      </Button>
      <Button variant="primary" type="button" onClick={handleSaveAndPublish}>
        Save &amp; Publish
      </Button>
    </div>
  );

  return (
    <Dialog
      title={step === 1 ? 'Create Policy' : 'Content'}
      open={open}
      onClose={handleClose}
      actions={step === 1 ? step1Actions : step2Actions}
      maxWidth="440px"
      position="right"
    >
      {/* ─── STEP 1 ─── */}
      {step === 1 && (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Policy Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Policy Title <span className={styles.required}>*</span>
            </label>
            <Input
              placeholder="e.g., Remote Work Policy"
              name="title"
              value={formData.title}
              onChange={(e) => handleField('title', e.target.value)}
              required
            />
          </div>

          {/* Description — textarea */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder="Briefly describe the purpose and scope of this policy..."
              name="description"
              value={formData.description}
              onChange={(e) => handleField('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Policy Type — Notion-style dropdown */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Policy Type <span className={styles.required}>*</span>
            </label>
            <PolicyTypeSelect
              categories={categoriesForSelect}
              value={formData.policyType}
              onChange={(val) => handleField('policyType', String(val))}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              placeholder="Select policy type"
            />
          </div>

          {/* Policy Icon — lucide icons in colored squares */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Policy icon <span className={styles.required}>*</span>
            </label>
            <div className={styles.iconGrid}>
              {POLICY_ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.iconBtn} ${formData.iconColor === item.id ? styles.selectedIcon : ''}`}
                  style={
                    formData.iconColor === item.id
                      ? { backgroundColor: item.bg, color: item.color, borderColor: item.color }
                      : { backgroundColor: item.bg, color: item.color }
                  }
                  onClick={() => handleField('iconColor', item.id)}
                  aria-label={item.id}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          <p className={styles.stepNote}>Step 1/2</p>
        </form>
      )}

      {/* ─── STEP 2 ─── */}
      {step === 2 && (
        <div className={styles.editorContainer}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('bold')}
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('italic')}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('underline')}
              title="Underline"
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('strikeThrough')}
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>
            <div className={styles.tbDivider} />
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('formatBlock', 'pre')}
              title="Code"
            >
              <Code size={13} />
            </button>
            <div className={styles.tbDivider} />
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('justifyLeft')}
              title="Align left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('justifyCenter')}
              title="Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('justifyRight')}
              title="Align right"
            >
              <AlignRight size={13} />
            </button>
            <div className={styles.tbDivider} />
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet list"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              className={styles.tbBtn}
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered list"
            >
              <ListOrdered size={13} />
            </button>
            <div className={styles.tbDivider} />
            <button type="button" className={styles.tbBtn} title="Link">
              <Link size={13} />
            </button>
            <button type="button" className={styles.tbBtn} title="Image">
              <Image size={13} />
            </button>
          </div>

          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start writing your policy content here…"
          />

          <p className={styles.editorHint}>Both of employees after saving</p>
        </div>
      )}
    </Dialog>
  );
};

export default CreatePolicyDialog;
