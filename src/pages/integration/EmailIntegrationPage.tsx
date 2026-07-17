import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Plus } from 'lucide-react';

import { PageHeader, Button, WarningModal } from '../../components/common';
import { PermissionGate } from '../../components/common';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { EmailIntegrationCard } from '../../features/integration/email/components/EmailIntegrationCard/EmailIntegrationCard';
import { useEmailIntegrations } from '../../features/integration/email/hooks/useEmailIntegrations';
import { useConnectGmail } from '../../features/integration/email/hooks/useConnectGmail';
import { useToggleIntegration } from '../../features/integration/email/hooks/useToggleIntegration';
import { useDisconnectIntegration } from '../../features/integration/email/hooks/useDisconnectIntegration';
import { useTestEmail } from '../../features/integration/email/hooks/useTestEmail';

import styles from './EmailIntegrationPage.module.scss';

import type { EmailIntegration } from '../../features/integration/email/types/emailIntegrationType';

const EmailIntegrationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const oauthHandled = useRef(false);

  const access = useModuleAccess(ModuleCode.INTEGRATION_EMAIL);
  const { data, isLoading, refetch } = useEmailIntegrations();

  const connect = useConnectGmail();
  const toggle = useToggleIntegration();
  const disconnect = useDisconnectIntegration();
  const test = useTestEmail();

  const [disconnectTarget, setDisconnectTarget] = useState<EmailIntegration | null>(null);

  const integrations = data?.data ?? [];

  // ── Handle the Google OAuth redirect return (?connected=success|error) ──────
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (!connected || oauthHandled.current) return;
    oauthHandled.current = true;

    if (connected === 'success') {
      const email = searchParams.get('email');
      showToast(
        email ? `Connected ${email} successfully` : 'Gmail connected successfully',
        'success',
      );
      refetch();
    } else {
      const reason = searchParams.get('reason');
      showToast(reason || 'Could not connect the Gmail account', 'error');
    }

    // Strip the query params so a refresh doesn't re-fire the toast.
    searchParams.delete('connected');
    searchParams.delete('email');
    searchParams.delete('reason');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, refetch]);

  const handleConnect = useCallback(() => connect.mutate(), [connect]);

  const isCardBusy = useCallback(
    (id: string): boolean =>
      (toggle.isPending && toggle.variables?.id === id) ||
      (test.isPending && test.variables?.id === id) ||
      (disconnect.isPending && disconnect.variables === id),
    [
      toggle.isPending,
      toggle.variables,
      test.isPending,
      test.variables,
      disconnect.isPending,
      disconnect.variables,
    ],
  );

  const handleConfirmDisconnect = useCallback(() => {
    if (!disconnectTarget) return;
    disconnect.mutate(disconnectTarget.id, {
      onSettled: () => setDisconnectTarget(null),
    });
  }, [disconnect, disconnectTarget]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Email Integration"
        subtitle="Connect a Gmail account so your organization's emails are sent from your own address."
        actions={
          <PermissionGate module={ModuleCode.INTEGRATION_EMAIL} action={ActionCode.CREATE}>
            <Button onClick={handleConnect} isLoading={connect.isPending}>
              <Plus size={16} />
              Connect Gmail
            </Button>
          </PermissionGate>
        }
      />

      {isLoading ? (
        <div className={styles.stateBox}>Loading email integrations…</div>
      ) : integrations.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <Mail size={28} />
          </div>
          <h3 className={styles.emptyTitle}>No email accounts connected</h3>
          <p className={styles.emptyText}>
            Connect a Gmail account to send your organization&apos;s outgoing emails from your own
            address instead of the default one.
          </p>
          <PermissionGate module={ModuleCode.INTEGRATION_EMAIL} action={ActionCode.CREATE}>
            <Button onClick={handleConnect} isLoading={connect.isPending}>
              <Plus size={16} />
              Connect Gmail
            </Button>
          </PermissionGate>
        </div>
      ) : (
        <div className={styles.list}>
          {integrations.map((integration) => (
            <EmailIntegrationCard
              key={integration.id}
              integration={integration}
              canManage={access.hasActivateAccess}
              canDelete={access.hasDeleteAccess}
              isBusy={isCardBusy(integration.id)}
              onToggle={(activate) => toggle.mutate({ id: integration.id, activate })}
              onTest={() => test.mutate({ id: integration.id })}
              onDisconnect={() => setDisconnectTarget(integration)}
            />
          ))}
        </div>
      )}

      <WarningModal
        isOpen={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        title="Disconnect email account?"
        description={
          <>
            {disconnectTarget?.email} will be disconnected and can no longer send email for your
            organization. You can reconnect it any time.
          </>
        }
        actionLabel="Disconnect"
        actionVariant="danger"
        isActionLoading={disconnect.isPending}
        onAction={handleConfirmDisconnect}
      />
    </div>
  );
};

export default EmailIntegrationPage;
