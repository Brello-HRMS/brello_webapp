import { STARTER_TEMPLATES } from '../../types/designerTypes';

import styles from './TemplateDesigner.module.scss';

interface StarterPickerProps {
  onSelect: (id: string) => void;
}

export const StarterPicker: React.FC<StarterPickerProps> = ({ onSelect }) => (
  <div className={styles.starterWrapper}>
    <p className={styles.starterTitle}>Start with a template or build from scratch</p>
    <div className={styles.starterGrid}>
      {STARTER_TEMPLATES.map((t) => (
        <button key={t.id} className={styles.starterCard} onClick={() => onSelect(t.id)}>
          <span className={styles.starterEmoji}>{t.emoji}</span>
          <span className={styles.starterName}>{t.name}</span>
          <span className={styles.starterDesc}>{t.description}</span>
        </button>
      ))}
      <button
        className={`${styles.starterCard} ${styles.starterCardBlank}`}
        onClick={() => onSelect('blank')}
      >
        <span className={styles.starterEmoji}>⬜</span>
        <span className={styles.starterName}>Blank</span>
        <span className={styles.starterDesc}>Start from an empty canvas</span>
      </button>
    </div>
  </div>
);
