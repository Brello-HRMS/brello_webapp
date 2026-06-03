import React from 'react';
import { CheckCircle, Download } from 'lucide-react';

import { Modal } from '../../../../components/common/Modal/Modal';
import { Button } from '../../../../components/ui/Button/Button';
import { useInvoicePdfUrl } from '../../hooks';

import styles from './PaymentSuccessModal.module.scss';

import type { VerifyPaymentData } from '../../types';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  data: VerifyPaymentData;
  userEmail: string;
  onBackToBilling: () => void;
}

const fmt = (dateStr: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(dateStr).toLocaleDateString(
    'en-IN',
    opts ?? { day: 'numeric', month: 'short', year: 'numeric' },
  );

const fmtDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const fmtCurrency = (amount: number) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  data,
  userEmail,
  onBackToBilling,
}) => {
  const { invoice, next_renewal_date } = data;
  const { mutate: fetchPdf, isPending: isDownloading } = useInvoicePdfUrl();

  const handleDownload = () => {
    fetchPdf(invoice.id, {
      onSuccess: (res) => {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      },
    });
  };

  const detail = (label: string, value: React.ReactNode) => (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} showCloseIcon={false}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <CheckCircle className={styles.icon} size={56} strokeWidth={1.5} />
        </div>

        <h2 className={styles.title}>Payment Successful!</h2>
        <p className={styles.subtitle}>Your payment has been received successfully.</p>

        <div className={styles.detailCard}>
          {detail('Invoice Number', invoice.invoice_number)}
          {detail('Amount Paid', fmtCurrency(invoice.total))}
          {invoice.paid_at && detail('Payment Date', fmtDateTime(invoice.paid_at))}
          {next_renewal_date && detail('Next Renewal Date', fmt(next_renewal_date))}
        </div>

        <p className={styles.receiptNote}>
          A receipt has been sent to
          <br />
          <span className={styles.email}>{userEmail}</span>
        </p>

        <div className={styles.actions}>
          <Button variant="outline" onClick={onBackToBilling} className={styles.backBtn}>
            Back to Billing
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            isLoading={isDownloading}
            className={styles.downloadBtn}
          >
            <Download size={16} />
            Download Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
