import React, { useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Handshake,
  FileEdit,
  Send,
  Eye,
  XCircle,
  Hourglass,
  ArchiveX,
  ArrowUpRight,
  BarChart2,
  PieChart,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

import { PageHeader } from '../../components/common';
import { useOfferAnalytics } from '../../features/offer-management/hooks/useOffers';

import styles from './OfferAnalyticsPage.module.scss';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const barVariants: Variants = {
  hidden: { width: 0 },
  visible: (width: string) => ({
    width,
    transition: { duration: 1, ease: 'easeOut', delay: 0.2 },
  }),
};

// Mock Sparkline Component for KPI Cards
const Sparkline = ({ color, data }: { color: string; data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const step = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' L ');

  const pathD = `M ${points}`;
  const fillPathD = `M 0,${height} L ${points} L ${width},${height} Z`;

  return (
    <svg width="100%" height="40" viewBox="0 -5 100 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPathD} fill={`url(#fill-${color})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Donut Chart Component
const DonutChart = ({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const { arcs } = data.reduce(
    (acc, item) => {
      const arcLength = (item.value / total) * circumference;
      const strokeDashoffset = -acc.offset;
      acc.arcs.push({
        ...item,
        strokeDasharray: `${arcLength} ${circumference}`,
        strokeDashoffset,
      });
      acc.offset += arcLength;
      return acc;
    },
    {
      arcs: [] as Array<(typeof data)[0] & { strokeDasharray: string; strokeDashoffset: number }>,
      offset: 0,
    },
  );

  return (
    <div className={styles.donutContainer}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-gray-100)"
          strokeWidth="16"
        />
        {arcs.map((item, i) => {
          if (item.value === 0) return null;

          return (
            <motion.circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={item.strokeDasharray}
              strokeDashoffset={item.strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: item.strokeDasharray }}
              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          );
        })}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutTotal}>{total}</span>
        <span className={styles.donutLabel}>Total</span>
      </div>
    </div>
  );
};

const OfferAnalyticsPage = () => {
  const { data: response, isLoading } = useOfferAnalytics();
  const analytics = response?.data;

  const chartData = useMemo(() => {
    if (!analytics) return [];
    const { by_status: byStatus } = analytics;
    return STATUS_CONFIG.map((conf) => ({
      ...conf,
      value: byStatus[conf.key] ?? 0,
    })).filter((c) => c.value > 0);
  }, [analytics]);

  if (isLoading || !analytics) {
    return (
      <div className={styles.page}>
        <PageHeader title="Offer Analytics" subtitle="Performance dashboard" />
        <div className={styles.loading}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading dashboard...
          </motion.div>
        </div>
      </div>
    );
  }

  const { by_status: byStatus } = analytics;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Offer Analytics"
        titleExtra={
          <span className={styles.pageBadge}>
            <BarChart2 size={16} /> Live Data
          </span>
        }
        subtitle="Comprehensive breakdown of offer pipeline and hiring metrics."
      />

      <motion.div
        className={styles.dashboardGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <KpiCard
            title="Total Offers"
            value={analytics.total}
            trend="+12%"
            color="#3b82f6"
            sparklineData={[10, 15, 12, 20, 18, 25, analytics.total]}
          />
          <KpiCard
            title="Acceptance Rate"
            value={`${analytics.acceptance_rate}%`}
            trend="+5%"
            color="#10b981"
            sparklineData={[60, 65, 70, 68, 75, 80, analytics.acceptance_rate]}
          />
          <KpiCard
            title="Negotiation Rate"
            value={`${analytics.negotiation_rate}%`}
            trend="-2%"
            color="#f59e0b"
            sparklineData={[15, 12, 14, 10, 8, 5, analytics.negotiation_rate]}
            trendDownIsGood
          />
          <KpiCard
            title="Avg. Acceptance Days"
            value={analytics.avg_acceptance_days != null ? analytics.avg_acceptance_days : '-'}
            suffix=" days"
            trend="-1.2d"
            color="#8b5cf6"
            sparklineData={[5, 6, 4, 3, 4, 2, analytics.avg_acceptance_days ?? 0]}
            trendDownIsGood
          />
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          {/* Pipeline Funnel / Bar Chart */}
          <motion.div className={styles.chartCard} variants={cardVariants}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <TrendingUp size={18} className={styles.cardIcon} />
                Conversion Pipeline
              </h3>
            </div>
            <div className={styles.barChart}>
              {STATUS_CONFIG.map(({ key, label, color, icon: Icon }) => {
                const count = byStatus[key] ?? 0;
                const percentage =
                  analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(1) : '0';
                const widthString = `${percentage}%`;

                return (
                  <div key={key} className={styles.barItem}>
                    <div className={styles.barLabelGroup}>
                      <Icon size={14} color={color} />
                      <span className={styles.barLabel}>{label}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <motion.div
                        className={styles.barFill}
                        style={{ backgroundColor: color }}
                        custom={widthString}
                        variants={barVariants}
                      />
                    </div>
                    <div className={styles.barMetrics}>
                      <span className={styles.barCount}>{count}</span>
                      <span className={styles.barPercentage}>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Donut Chart for Distribution */}
          <motion.div className={styles.chartCard} variants={cardVariants}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <PieChart size={18} className={styles.cardIcon} />
                Status Distribution
              </h3>
            </div>
            <div className={styles.donutLayout}>
              {chartData.length > 0 ? (
                <>
                  <DonutChart data={chartData} total={analytics.total} />
                  <div className={styles.donutLegend}>
                    {chartData.map((item) => (
                      <div key={item.key} className={styles.legendItem}>
                        <span
                          className={styles.legendDot}
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={styles.legendLabel}>{item.label}</span>
                        <span className={styles.legendValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.emptyChart}>No data available</div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const KpiCard = ({
  title,
  value,
  suffix = '',
  trend,
  color,
  sparklineData,
  trendDownIsGood = false,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  trend: string;
  color: string;
  sparklineData: number[];
  trendDownIsGood?: boolean;
}) => {
  const isPositiveTrend = trend.startsWith('+');
  const isGood = isPositiveTrend ? !trendDownIsGood : trendDownIsGood;

  return (
    <motion.div className={styles.analyticCard} variants={cardVariants}>
      <div className={styles.analyticHeader}>
        <span className={styles.analyticTitle}>{title}</span>
        <div
          className={`${styles.trendBadge} ${isGood ? styles.trendGood : styles.trendBad}`}
          style={{ '--trend-color': color } as React.CSSProperties}
        >
          {isPositiveTrend ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowUpRight size={14} style={{ transform: 'rotate(90deg)' }} />
          )}
          {trend}
        </div>
      </div>
      <div className={styles.analyticBody}>
        <div className={styles.analyticValueGroup}>
          <span className={styles.analyticValue}>{value}</span>
          {suffix && <span className={styles.analyticSuffix}>{suffix}</span>}
        </div>
        <div className={styles.sparklineContainer}>
          <Sparkline color={color} data={sparklineData} />
        </div>
      </div>
    </motion.div>
  );
};

const STATUS_CONFIG = [
  { key: 'DRAFT' as const, label: 'Draft', color: '#64748b', icon: FileEdit },
  { key: 'SENT' as const, label: 'Sent', color: '#3b82f6', icon: Send },
  { key: 'VIEWED' as const, label: 'Viewed', color: '#8b5cf6', icon: Eye },
  { key: 'NEGOTIATING' as const, label: 'Negotiating', color: '#f59e0b', icon: Handshake },
  { key: 'ACCEPTED' as const, label: 'Accepted', color: '#10b981', icon: CheckCircle2 },
  { key: 'REJECTED' as const, label: 'Rejected', color: '#ef4444', icon: XCircle },
  { key: 'EXPIRED' as const, label: 'Expired', color: '#94a3b8', icon: Hourglass },
  { key: 'WITHDRAWN' as const, label: 'Withdrawn', color: '#475569', icon: ArchiveX },
];

export default OfferAnalyticsPage;
