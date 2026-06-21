import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { OrgProfileHeader } from '../../features/organization/components/OrgProfileHeader/OrgProfileHeader';
import { OrgCompanyCard } from '../../features/organization/components/OrgCompanyCard/OrgCompanyCard';
import { OrgContactCard } from '../../features/organization/components/OrgContactCard/OrgContactCard';
import { OrgAddressCard } from '../../features/organization/components/OrgAddressCard/OrgAddressCard';
import { OrgPlatformCard } from '../../features/organization/components/OrgPlatformCard/OrgPlatformCard';
import { useOrgProfile, useOrgStats } from '../../features/organization/hooks';
import { getOrganizationId } from '../../utils/authUtils';

import styles from './OrganizationProfilePage.module.scss';

const OrganizationProfilePage: React.FC = () => {
  const orgId = getOrganizationId();

  const { data: profile, isLoading, isError } = useOrgProfile(orgId);
  const { data: stats } = useOrgStats(orgId);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className={styles.center}>
        <AlertTriangle size={28} className={styles.errorIcon} />
        <p className={styles.errorText}>Failed to load organisation profile.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Organisation Profile"
        subtitle="Manage your company information and contact details."
      />

      <OrgProfileHeader profile={profile} />

      <div className={styles.grid}>
        <div className={styles.col}>
          <OrgCompanyCard profile={profile} />
          <OrgAddressCard profile={profile} />
        </div>
        <div className={styles.col}>
          <OrgContactCard profile={profile} />
          <OrgPlatformCard profile={profile} stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfilePage;
