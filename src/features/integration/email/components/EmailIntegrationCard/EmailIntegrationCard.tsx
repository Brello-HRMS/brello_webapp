import React from 'react';
import { Mail, Send, Unplug, CheckCircle2 } from 'lucide-react';

import { Button } from '../../../../../components/common';
import { ToggleButton } from '../../../../../components/common';

import styles from './EmailIntegrationCard.module.scss';

import type { EmailIntegration } from '../../types/emailIntegrationType';

export interface EmailIntegrationCardProps {
  integration: EmailIntegration;
  canManage: boolean;
  canDelete: boolean;
  isBusy: boolean;
  onToggle: (activate: boolean) => void;
  onTest: () => void;
  onDisconnect: () => void;
}

const formatLastUsed = (value: string | null): string => {
  if (!value) return 'Never used';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never used';
  return `Last used ${date.toLocaleDateString()}`;
};

export const EmailIntegrationCard: React.FC<EmailIntegrationCardProps> = ({
  integration,
  canManage,
  canDelete,
  isBusy,
  onToggle,
  onTest,
  onDisconnect,
}) => {
  const { email, display_name, is_active, last_used_at } = integration;

  return (
    <div className={`${styles.card} ${is_active ? styles.active : ''}`.trim()}>
      <div className={styles.identity}>
        <div className={styles.avatar}>
          <Mail size={20} />
        </div>
        <div className={styles.details}>
          <div className={styles.emailRow}>
            <span className={styles.email}>{email}</span>
            {is_active && (
              <span className={styles.activeBadge}>
                <CheckCircle2 size={13} />
                Active sender
              </span>
            )}
          </div>
          <span className={styles.meta}>
            {display_name ? `${display_name} · ` : ''}
            {formatLastUsed(last_used_at)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <ToggleButton
          checked={is_active}
          disabled={!canManage || isBusy}
          onChange={(checked) => onToggle(checked)}
          label={is_active ? 'On' : 'Off'}
        />
        <Button variant="ghost" size="sm" onClick={onTest} disabled={isBusy}>
          <Send size={15} />
          Test
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.disconnect}
            onClick={onDisconnect}
            disabled={isBusy}
          >
            <Unplug size={15} />
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
};
