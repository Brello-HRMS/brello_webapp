import React, { useState } from 'react';
import { Loader2, Download, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { Button } from '../../components/ui/Button/Button';
import { PaymentSuccessModal } from '../../features/billing/components/PaymentSuccessModal/PaymentSuccessModal';
import {
  useCurrentInvoice,
  useInitiatePayment,
  useVerifyPayment,
  useInvoicePdfUrl,
} from '../../features/billing/hooks';
import { openRazorpayCheckout } from '../../features/billing/hooks/useRazorpay';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { getAuthUser } from '../../utils/authUtils';
import { InvoiceStatus } from '../../features/billing/types';

import styles from './BillingInvoicePage.module.scss';

import type { VerifyPaymentData } from '../../features/billing/types';

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

const getDueLabel = (
  dueDateStr: string,
): { label: string; variant: 'warning' | 'danger' | 'success' } => {
  const diff = Math.ceil((new Date(dueDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return { label: `Due in ${diff} day${diff === 1 ? '' : 's'}`, variant: 'warning' };
  if (diff === 0) return { label: 'Due today', variant: 'danger' };
  return {
    label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`,
    variant: 'danger',
  };
};

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: styles.statusPending,
  [InvoiceStatus.PAID]: styles.statusPaid,
  [InvoiceStatus.FAILED]: styles.statusFailed,
  [InvoiceStatus.OVERDUE]: styles.statusOverdue,
  [InvoiceStatus.CANCELLED]: styles.statusCancelled,
};

// ── Component ─────────────────────────────────────────────────────────────────

const BillingInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();

  const { data: invoiceRes, isLoading } = useCurrentInvoice();
  const { mutate: initiate, isPending: isInitiating } = useInitiatePayment();
  const { mutate: verify, isPending: isVerifying } = useVerifyPayment();
  const { mutate: fetchPdf, isPending: isDownloadingPdf } = useInvoicePdfUrl();

  const [successData, setSuccessData] = useState<VerifyPaymentData | null>(null);

  const invoice = invoiceRes?.data ?? null;

  const canPay =
    invoice &&
    (invoice.invoice_status === InvoiceStatus.PENDING ||
      invoice.invoice_status === InvoiceStatus.FAILED ||
      invoice.invoice_status === InvoiceStatus.OVERDUE);

  const isPaymentInFlight = isInitiating || isVerifying;

  const handlePayNow = () => {
    if (!invoice) return;

    initiate(invoice.id, {
      onSuccess: (res) => {
        const { razorpay_key_id, razorpay_order_id, amount, currency, invoice_number } = res.data;

        try {
          openRazorpayCheckout({
            key: razorpay_key_id,
            amount,
            currency,
            order_id: razorpay_order_id,
            name: 'Brello',
            description: `Invoice ${invoice_number}`,
            theme: { color: '#7C3AED' },
            prefill: {
              email: authUser?.email,
              name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() : undefined,
            },
            handler: (response) => {
              verify(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  onSuccess: (verifyRes) => {
                    setSuccessData(verifyRes.data);
                  },
                },
              );
            },
            modal: {
              ondismiss: () => {
                // User closed the checkout without paying — silent, no toast needed.
              },
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Could not open payment window.';
          showToast(msg, 'error');
        }
      },
    });
  };

  const handleDownloadPdf = () => {
    if (!invoice) return;
    fetchPdf(invoice.id, {
      onSuccess: (res) => {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      },
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader title="Invoices" subtitle="View and download billing invoices." />
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={32} />
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────

  if (!invoice) {
    return (
      <div className={styles.page}>
        <PageHeader title="Invoices" subtitle="View and download billing invoices." />
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No pending invoice</h3>
          <p className={styles.emptyDesc}>
            You have no open invoice right now. Your next invoice will appear here when it is
            generated.
          </p>
        </div>
      </div>
    );
  }

  // ── Invoice view ───────────────────────────────────────────────────────────

  const due = getDueLabel(invoice.due_date);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Invoices"
        subtitle="View and download billing invoices."
        actions={
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadPdf}
              isLoading={isDownloadingPdf}
              disabled={isDownloadingPdf}
            >
              <Download size={16} />
              Download Pdf
            </Button>

            {canPay && (
              <Button
                variant="primary"
                size="md"
                onClick={handlePayNow}
                isLoading={isPaymentInFlight}
                disabled={isPaymentInFlight}
              >
                <CreditCard size={16} />
                {isVerifying ? 'Verifying…' : isInitiating ? 'Opening…' : 'Pay Now'}
              </Button>
            )}
          </div>
        }
      />

      {/* ── Meta card ─────────────────────────────────────────────────────── */}
      <div className={styles.metaCard}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Invoice Number</span>
          <span className={styles.metaValue}>{invoice.invoice_number}</span>
        </div>

        <div className={styles.metaDivider} />

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Invoice Date</span>
          <span className={styles.metaValue}>{fmtDate(invoice.invoice_date)}</span>
        </div>

        <div className={styles.metaDivider} />

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Due Date</span>
          <div className={styles.metaDueRow}>
            <span className={styles.metaValue}>{fmtDate(invoice.due_date)}</span>
            {invoice.invoice_status !== InvoiceStatus.PAID && (
              <span className={`${styles.dueBadge} ${styles[`due_${due.variant}`]}`}>
                {due.label}
              </span>
            )}
          </div>
        </div>

        <div className={styles.metaDivider} />

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[invoice.invoice_status]}`}>
            {invoice.invoice_status}
          </span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className={styles.body}>
        {/* Invoice breakdown */}
        <div className={styles.breakdownCard}>
          <h3 className={styles.cardTitle}>Invoice Breakdown</h3>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thDesc}>Description</th>
                <th className={styles.thNum}>Qty</th>
                <th className={styles.thNum}>Unit Price</th>
                <th className={styles.thNum}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.line_items ?? []).map((item) => (
                <tr key={item.id} className={styles.tr}>
                  <td className={styles.tdDesc}>{item.line_description}</td>
                  <td className={styles.tdNum}>{item.quantity}</td>
                  <td className={styles.tdNum}>{fmtCurrency(item.unit_price)}</td>
                  <td className={styles.tdNum}>{fmtCurrency(item.amount)}</td>
                </tr>
              ))}

              {/* Fallback when line_items isn't loaded */}
              {(!invoice.line_items || invoice.line_items.length === 0) && (
                <tr className={styles.tr}>
                  <td className={styles.tdDesc}>{invoice.plan_name_snapshot} Plan Users</td>
                  <td className={styles.tdNum}>{invoice.employee_count_snapshot}</td>
                  <td className={styles.tdNum}>{fmtCurrency(invoice.price_per_employee)}</td>
                  <td className={styles.tdNum}>{fmtCurrency(invoice.subtotal)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <p className={styles.thankyou}>Thank you for choosing Brello.</p>
        </div>

        {/* Tax summary */}
        <div className={styles.taxCard}>
          <h3 className={styles.cardTitle}>Tax Summary</h3>

          <div className={styles.taxRows}>
            <div className={styles.taxRow}>
              <span className={styles.taxLabel}>Subtotal</span>
              <span className={styles.taxValue}>{fmtCurrency(invoice.subtotal)}</span>
            </div>
            <div className={styles.taxRow}>
              <span className={styles.taxLabel}>GST ({invoice.gst_rate}%)</span>
              <span className={styles.taxValue}>{fmtCurrency(invoice.gst_amount)}</span>
            </div>
            <div className={styles.taxDivider} />
            <div className={styles.taxRow}>
              <span className={styles.taxTotalLabel}>Total</span>
              <span className={styles.taxTotal}>{fmtCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Success Modal ──────────────────────────────────────────── */}
      {successData && (
        <PaymentSuccessModal
          isOpen={!!successData}
          data={successData}
          userEmail={authUser?.email ?? ''}
          onBackToBilling={() => {
            setSuccessData(null);
            navigate('/billing/plan');
          }}
        />
      )}
    </div>
  );
};

export default BillingInvoicePage;
