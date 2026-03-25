import React, { useState } from 'react';
import { MdEditor, MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

import styles from './MarkdownEditor.module.scss';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  previewOnly?: boolean;
  className?: string;
  height?: string | number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  previewOnly = false,
  className = '',
  height = '100%',
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleUploadImg = async (_files: File[]) => {
    // Placeholder for image upload logic
  };

  if (previewOnly) {
    return (
      <div className={`${styles.previewWrapper} ${className}`}>
        <MdPreview modelValue={value} />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} style={{ height }}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'write' ? styles.active : ''}`}
          onClick={() => setActiveTab('write')}
        >
          Write
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className={styles.editorWrapper}>
        {activeTab === 'write' ? (
          <MdEditor
            modelValue={value}
            onChange={onChange || (() => {})}
            placeholder={placeholder}
            disabled={readOnly}
            language="en-US"
            theme="light"
            preview={false}
            onUploadImg={handleUploadImg}
            toolbars={[
              'bold',
              'italic',
              'underline',
              'strikeThrough',
              '-',
              'title',
              'sub',
              'sup',
              'quote',
              'unorderedList',
              'orderedList',
              'task',
              '-',
              'codeRow',
              'code',
              'link',
              'image',
              'table',
              '-',
              'revoke',
              'next',
            ]}
            footers={['markdownTotal']}
            style={{ height: '100%' }}
          />
        ) : (
          <div className={styles.previewContent}>
            <MdPreview modelValue={value} />
          </div>
        )}
      </div>
    </div>
  );
};
