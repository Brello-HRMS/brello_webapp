import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

import { getDocumentSignedUrl } from '../../../../api/documents';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import { getOrganizationId } from '../../../../utils/authUtils';
import { useOrgProfile } from '../../../organization/hooks';

import styles from './OrgBanner.module.scss';

interface OrgBannerProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function extractSignedUrl(res: unknown): string | null {
  if (!res || typeof res !== 'object') return null;
  const r = res as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | undefined;
  const raw = data?.url ?? r.url ?? null;
  return resolveAssetUrl(typeof raw === 'string' ? raw : null);
}

export const OrgBanner = ({ isCollapsed, onToggleCollapse }: OrgBannerProps) => {
  const orgId = getOrganizationId();
  const { data: profile } = useOrgProfile(orgId);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!profile?.logo_id) {
        setLogoUrl(null);
        return;
      }
      try {
        const res = await getDocumentSignedUrl(profile.logo_id);
        setLogoUrl(extractSignedUrl(res));
      } catch {
        setLogoUrl(null);
      }
    })();
  }, [profile?.logo_id]);

  const orgName = profile?.organization?.name ?? profile?.name ?? 'Organisation';

  return (
    <div
      className={`${styles.header} ${isCollapsed ? styles.collapsed : ''}`}
      onClick={onToggleCollapse}
      title={isCollapsed ? orgName : undefined}
    >
      <div className={styles.logoBox}>
        {logoUrl ? (
          <img src={logoUrl} alt={orgName} className={styles.logoImg} />
        ) : (
          <div className={styles.logoFallback}>
            <Building2 size={18} />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className={styles.identity}>
          <span className={styles.orgName}>{orgName}</span>
          <span className={styles.appLabel}>Admin Panel</span>
        </div>
      )}
    </div>
  );
};
