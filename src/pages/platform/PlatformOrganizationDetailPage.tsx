import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  Mail,
  Phone,
  FileText,
  Calendar,
} from 'lucide-react';

import { StatusBadge } from '../../components/common';
import {
  useOrganization,
  useOrgStats,
  useOrgSubscriptions,
} from '../../features/platform/organizations/hooks';

import styles from './PlatformOrganizationDetailPage.module.scss';

import type {
  OrgSubscription,
  SubscriptionStatus,
} from '../../features/platform/organizations/types';

const SUB_STATUS_META: Record<SubscriptionStatus, { label: string; className: string }> = {
  Trial: { label: 'Trial', className: styles.statusTrial },
  Active: { label: 'Active', className: styles.statusActive },
  Grace: { label: 'Grace Period', className: styles.statusGrace },
  Expired: { label: 'Expired', className: styles.statusExpired },
  Cancelled: { label: 'Cancelled', className: styles.statusCancelled },
};

const SubStatusBadge = ({ status }: { status: SubscriptionStatus }) => {
  const meta = SUB_STATUS_META[status] ?? { label: status, className: '' };
  return <span className={`${styles.subStatusBadge} ${meta.className}`}>{meta.label}</span>;
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={styles.infoValue}>{value ?? '—'}</span>
  </div>
);

const SubscriptionCard = ({ sub }: { sub: OrgSubscription }) => (
  <div className={styles.subCard}>
    <div className={styles.subCardHeader}>
      <div>
        <div className={styles.subPlanName}>{sub.plan?.name ?? '—'}</div>
        <div className={styles.subMeta}>
          {sub.billing_cycle} · {sub.is_trial ? 'Trial' : 'Paid'}
        </div>
      </div>
      <SubStatusBadge status={sub.sub_status} />
    </div>
    <div className={styles.subCardBody}>
      <div className={styles.subStat}>
        <Calendar size={14} />
        <span>
          {new Date(sub.start_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
          {sub.end_date
            ? ` → ${new Date(sub.end_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}`
            : ' → Ongoing'}
        </span>
      </div>
      {sub.next_renewal_date && (
        <div className={styles.subStat}>
          <CreditCard size={14} />
          <span>
            Renews{' '}
            {new Date(sub.next_renewal_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
      <div className={styles.subStat}>
        <FileText size={14} />
        <span>
          ₹{Number(sub.plan?.price_per_employee ?? 0).toLocaleString('en-IN')} / employee / month
        </span>
      </div>
    </div>
  </div>
);

const TABS = ['Profile', 'Subscriptions'] as const;
type Tab = (typeof TABS)[number];

const PlatformOrganizationDetailPage = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Profile');

  const { data: orgData, isLoading: orgLoading } = useOrganization(orgId!);
  const { data: stats } = useOrgStats(orgId!);
  const { data: subscriptions } = useOrgSubscriptions(orgId!);

  const org = orgData?.data;
  const profile = org?.profile;
  const activeSub = subscriptions?.find(
    (s) => s.sub_status === 'Active' || s.sub_status === 'Trial',
  );

  if (orgLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Organisation not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back */}
      <button className={styles.backBtn} onClick={() => navigate('/platform/organizations')}>
        <ArrowLeft size={16} />
        Organisations
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.orgAvatar}>
            {org.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <h1 className={styles.orgName}>{org.name}</h1>
            <div className={styles.orgSub}>{org.subdomain}</div>
          </div>
        </div>
        <StatusBadge status={org.status} />
      </div>

      {/* Stat cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Users size={20} className={styles.statIcon} />
          <div className={styles.statValue}>{stats?.employee_count ?? '—'}</div>
          <div className={styles.statLabel}>Employees</div>
        </div>
        <div className={styles.statCard}>
          <Building2 size={20} className={styles.statIcon} />
          <div className={styles.statValue}>{org.enterprise?.name ?? '—'}</div>
          <div className={styles.statLabel}>Enterprise</div>
        </div>
        <div className={styles.statCard}>
          <CreditCard size={20} className={styles.statIcon} />
          <div className={styles.statValue}>{activeSub?.plan?.name ?? 'None'}</div>
          <div className={styles.statLabel}>Active Plan</div>
        </div>
        <div className={styles.statCard}>
          <FileText size={20} className={styles.statIcon} />
          <div className={styles.statValue}>{subscriptions?.length ?? 0}</div>
          <div className={styles.statLabel}>Subscriptions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Profile' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            <div className={styles.infoGrid}>
              <InfoRow label="Name" value={profile?.name} />
              <InfoRow
                label="Email"
                value={
                  profile?.email ? (
                    <span className={styles.iconRow}>
                      <Mail size={13} />
                      {profile.email}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Phone"
                value={
                  profile?.phone ? (
                    <span className={styles.iconRow}>
                      <Phone size={13} />
                      {profile.phone}
                    </span>
                  ) : null
                }
              />
              <InfoRow label="GST No." value={profile?.gst_no} />
              <InfoRow label="Registration No." value={profile?.registration_no} />
              <InfoRow label="Domain" value={profile?.domain} />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Address</h3>
            <div className={styles.infoGrid}>
              <InfoRow label="Address" value={profile?.address} />
              <InfoRow label="City" value={profile?.city} />
              <InfoRow label="State" value={profile?.state} />
              <InfoRow label="ZIP Code" value={profile?.zip_code} />
              <InfoRow label="Country" value={profile?.country} />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Platform</h3>
            <div className={styles.infoGrid}>
              <InfoRow label="Subdomain" value={org.subdomain} />
              <InfoRow label="Enterprise" value={org.enterprise?.name} />
              <InfoRow
                label="Created"
                value={new Date(org.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Subscriptions' && (
        <div className={styles.tabContent}>
          {!subscriptions || subscriptions.length === 0 ? (
            <div className={styles.emptySection}>No subscriptions found for this organisation.</div>
          ) : (
            <div className={styles.subList}>
              {subscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformOrganizationDetailPage;
