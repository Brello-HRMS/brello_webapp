import { TrendingUp, CheckCircle, MessageCircle, Clock, Users } from 'lucide-react';

import { PageHeader } from '../../components/common';
import { useOfferAnalytics } from '../../features/offer-management/hooks/useOffers';

import styles from './OfferAnalyticsPage.module.scss';

const OfferAnalyticsPage = () => {
  const { data: response, isLoading } = useOfferAnalytics();
  const analytics = response?.data;

  if (isLoading || !analytics) {
    return (
      <div className={styles.page}>
        <PageHeader title="Offer Analytics" subtitle="Recruiter KPI dashboard" />
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  const { by_status: byStatus } = analytics;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Offer Analytics"
        titleExtra={
          <span className={styles.pageIcon}>
            <TrendingUp size={20} />
          </span>
        }
        subtitle="Track your offer pipeline and hiring metrics."
      />

      <div className={styles.kpiGrid}>
        <KpiCard
          icon={<Users size={22} />}
          label="Total Offers"
          value={analytics.total}
          color="blue"
        />
        <KpiCard
          icon={<CheckCircle size={22} />}
          label="Acceptance Rate"
          value={`${analytics.acceptance_rate}%`}
          color="green"
        />
        <KpiCard
          icon={<MessageCircle size={22} />}
          label="Negotiation Rate"
          value={`${analytics.negotiation_rate}%`}
          color="orange"
        />
        <KpiCard
          icon={<Clock size={22} />}
          label="Avg. Acceptance Days"
          value={
            analytics.avg_acceptance_days != null ? `${analytics.avg_acceptance_days} days` : '—'
          }
          color="purple"
        />
      </div>

      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <h3 className={styles.statusTitle}>Pipeline Breakdown</h3>
          <div className={styles.statusRows}>
            {STATUS_CONFIG.map(({ key, label, color }) => (
              <div key={key} className={styles.statusRow}>
                <span className={styles.statusLabel}>{label}</span>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width:
                        analytics.total > 0
                          ? `${Math.round(((byStatus[key] ?? 0) / analytics.total) * 100)}%`
                          : '0%',
                      background: color,
                    }}
                  />
                </div>
                <span className={styles.statusCount}>{byStatus[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) => (
  <div className={`${styles.kpiCard} ${styles[`kpiCard_${color}`]}`}>
    <div className={styles.kpiIcon}>{icon}</div>
    <div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
    </div>
  </div>
);

const STATUS_CONFIG = [
  { key: 'DRAFT' as const, label: 'Draft', color: '#94a3b8' },
  { key: 'SENT' as const, label: 'Sent', color: '#3b82f6' },
  { key: 'VIEWED' as const, label: 'Viewed', color: '#8b5cf6' },
  { key: 'NEGOTIATING' as const, label: 'Negotiating', color: '#f97316' },
  { key: 'ACCEPTED' as const, label: 'Accepted', color: '#10b981' },
  { key: 'REJECTED' as const, label: 'Rejected', color: '#ef4444' },
  { key: 'EXPIRED' as const, label: 'Expired', color: '#9ca3af' },
  { key: 'WITHDRAWN' as const, label: 'Withdrawn', color: '#6b7280' },
];

export default OfferAnalyticsPage;
