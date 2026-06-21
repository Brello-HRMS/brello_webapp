import React, { useEffect, useRef, useState } from 'react';
import { Building2, Camera, Loader2 } from 'lucide-react';

import { getDocumentSignedUrl, uploadDocumentData, uploadDocumentUrl } from '../../../../api/documents';
import { getOrganizationId } from '../../../../utils/authUtils';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import { showToast } from '../../../ToastFeature/ShowToast';
import { useUpdateOrgProfile } from '../../hooks';

import styles from './OrgProfileHeader.module.scss';

import type { OrganizationProfile } from '../../types';

interface OrgProfileHeaderProps {
  profile: OrganizationProfile;
}

// The axios interceptor returns response.data (the TransformInterceptor wrapper),
// so the actual URL is at res.data.url even though the TS type says res.url.
function extractSignedUrl(res: unknown): string | null {
  if (!res || typeof res !== 'object') return null;
  const r = res as Record<string, any>;
  const raw = r?.data?.url ?? r?.url ?? null;
  return resolveAssetUrl(raw);
}

export const OrgProfileHeader: React.FC<OrgProfileHeaderProps> = ({ profile }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const orgId = getOrganizationId() ?? '';
  const { mutateAsync: updateProfile } = useUpdateOrgProfile(orgId);

  useEffect(() => {
    if (!profile.logo_id) {
      setLogoUrl(null);
      return;
    }
    getDocumentSignedUrl(profile.logo_id)
      .then((res) => setLogoUrl(extractSignedUrl(res)))
      .catch(() => setLogoUrl(null));
  }, [profile.logo_id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo must be under 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadDocumentUrl({
        folderType: 'ORGANIZATION_LOGO',
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        organizationId: orgId,
      });
      const docId = uploadRes.data.documentId;
      await uploadDocumentData(docId, file);
      await updateProfile({ profileId: profile.id, payload: { logo_id: docId } });
      const signedRes = await getDocumentSignedUrl(docId);
      setLogoUrl(extractSignedUrl(signedRes));
    } catch {
      showToast('Logo upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const { organization, industry_type } = profile;

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper} onClick={() => !uploading && fileRef.current?.click()}>
        {uploading ? (
          <div className={styles.logoPlaceholder}>
            <Loader2 size={28} className={styles.spinner} />
          </div>
        ) : logoUrl ? (
          <img src={logoUrl} alt="Company logo" className={styles.logo} />
        ) : (
          <div className={styles.logoPlaceholder}>
            <Building2 size={32} />
          </div>
        )}
        <div className={styles.cameraOverlay}>
          <Camera size={16} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </div>

      <div className={styles.identity}>
        <h1 className={styles.orgName}>{organization.name}</h1>
        <div className={styles.badges}>
          {organization.subdomain && (
            <span className={styles.badge}>{organization.subdomain}.brello.co.in</span>
          )}
          {industry_type && (
            <span className={`${styles.badge} ${styles.industry}`}>{industry_type.name}</span>
          )}
        </div>
        {profile.name !== organization.name && (
          <p className={styles.legalName}>Legal name: {profile.name}</p>
        )}
        <p className={styles.uploadHint}>
          <Camera size={11} /> Click the logo to change it
        </p>
      </div>
    </div>
  );
};
