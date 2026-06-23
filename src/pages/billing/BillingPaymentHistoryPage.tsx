import React, { useState } from 'react';
import { Loader2, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { Button } from '../../components/ui/Button/Button';
import { useInvoiceList, useInvoicePdfUrl } from '../../features/billing/hooks';
import { InvoiceStatus } from '../../features/billing/types';

import styles from './BillingPaymentHistoryPage.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const fmtCurrency = (amount: number | string) =>
  `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: 'Pending',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.FAILED]: 'Failed',
  [InvoiceStatus.OVERDUE]: 'Overdue',
  [InvoiceStatus.CANCELLED]: 'Cancelled',
};

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: styles.statusPending,
  [InvoiceStatus.PAID]: styles.statusPaid,
  [InvoiceStatus.FAILED]: styles.statusFailed,
  [InvoiceStatus.OVERDUE]: styles.statusOverdue,
  [InvoiceStatus.CANCELLED]: styles.statusCancelled,
};

const ALL_STATUSES = Object.values(InvoiceStatus);
const PAGE_LIMIT = 10;

// ── Component ─────────────────────────────────────────────────────────────────

const BillingPaymentHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: listRes, isLoading } = useInvoiceList({
    page,
    limit: PAGE_LIMIT,
    invoice_status: statusFilter,
  });

  const { mutate: fetchPdf } = useInvoicePdfUrl();

  const invoices = listRes?.data?.data ?? [];
  const total = listRes?.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const handleDownload = (invoiceId: string) => {
    setDownloadingId(invoiceId);
    fetchPdf(invoiceId, {
      onSuccess: (res) => {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      },
      onSettled: () => setDownloadingId(null),
    });
  };

  const handleFilterChange = (status: InvoiceStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  // ── Filter bar ─────────────────────────────────────────────────────────────

  const filterBar = (
    <div className={styles.filterBar}>
      <button
        className={`${styles.filterBtn} ${!statusFilter ? styles.filterActive : ''}`}
        onClick={() => handleFilterChange(undefined)}
      >
        All
      </button>
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
          onClick={() => handleFilterChange(s)}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader title="Payment History" subtitle="View all your billing transactions." />
        {filterBar}
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Payment History" subtitle="View all your billing transactions." />

      {filterBar}

      {invoices.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No invoices found</h3>
          <p className={styles.emptyDesc}>
            {statusFilter
              ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} invoices to show.`
              : 'Your invoice history will appear here once invoices are generated.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Invoice No.</th>
                  <th className={styles.th}>Plan</th>
                  <th className={styles.th}>Invoice Date</th>
                  <th className={styles.th}>Due Date</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.thAction}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.invoiceNum}>{inv.invoice_number}</span>
                    </td>
                    <td className={styles.td}>{inv.plan_name_snapshot}</td>
                    <td className={styles.td}>{fmtDate(inv.invoice_date)}</td>
                    <td className={styles.td}>
                      <div className={styles.dueDateCell}>
                        <span>{fmtDate(inv.due_date)}</span>
                        {inv.paid_at && (
                          <span className={styles.paidAt}>Paid {fmtDate(inv.paid_at)}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdAmount}>{fmtCurrency(inv.total)}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${STATUS_CLASS[inv.invoice_status]}`}>
                        {STATUS_LABELS[inv.invoice_status]}
                      </span>
                    </td>
                    <td className={styles.tdAction}>
                      <button
                        className={styles.downloadBtn}
                        onClick={() => handleDownload(inv.id)}
                        disabled={downloadingId === inv.id}
                        title="Download PDF"
                        aria-label={`Download invoice ${inv.invoice_number}`}
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 size={15} className={styles.spin} />
                        ) : (
                          <Download size={15} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages} &nbsp;·&nbsp; {total} invoice{total !== 1 ? 's' : ''}
              </span>
              <div className={styles.pageControls}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillingPaymentHistoryPage;
