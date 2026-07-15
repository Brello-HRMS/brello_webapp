import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings } from 'lucide-react';

import { Button, PageHeader } from '../../components/common';
import {
  useOfferSettings,
  useUpdateOfferSettings,
} from '../../features/offer-management/hooks/useOffers';

import styles from './OfferSettingsPage.module.scss';

import type { UpdateOfferSettingsParams } from '../../features/offer-management/types/offerTypes';

const OfferSettingsPage = () => {
  const { data: response, isLoading } = useOfferSettings();
  const settings = response?.data;
  const { mutate: updateSettings, isPending } = useUpdateOfferSettings();

  const { register, handleSubmit, reset } = useForm<UpdateOfferSettingsParams>();

  useEffect(() => {
    if (settings) {
      reset({
        offer_prefix: settings.offer_prefix,
        offer_expiry_days: settings.offer_expiry_days,
        allow_download: settings.allow_download,
        enable_request_changes: settings.enable_request_changes,
        enable_digital_signature: settings.enable_digital_signature,
        auto_welcome_email: settings.auto_welcome_email,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: UpdateOfferSettingsParams) => {
    updateSettings(data);
  };

  if (isLoading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div>
      <PageHeader
        title="Offer Settings"
        titleExtra={
          <span className={styles.pageIcon}>
            <Settings size={20} />
          </span>
        }
        subtitle="Configure default behaviour for the offer management module."
      />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>General</h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Offer Number Prefix</label>
              <input className={styles.input} {...register('offer_prefix')} placeholder="OFF" />
              <span className={styles.helper}>Example: OFF-2026-000001</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Offer Expiry (days)</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                {...register('offer_expiry_days', { valueAsNumber: true })}
                placeholder="7"
              />
              <span className={styles.helper}>Candidates must respond within this period.</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Candidate Portal</h3>

          <div className={styles.toggleList}>
            <ToggleField
              label="Allow candidates to download the offer PDF"
              name="allow_download"
              register={register}
            />
            <ToggleField
              label="Enable candidates to request changes (counter-offer)"
              name="enable_request_changes"
              register={register}
            />
            <ToggleField
              label="Embed digital signature in the offer PDF"
              name="enable_digital_signature"
              register={register}
            />
            <ToggleField
              label="Send welcome email automatically on acceptance"
              name="auto_welcome_email"
              register={register}
            />
          </div>
        </section>

        <div className={styles.formActions}>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ToggleField = ({
  label,
  name,
  register,
}: {
  label: string;
  name: keyof UpdateOfferSettingsParams;
  register: ReturnType<typeof useForm<UpdateOfferSettingsParams>>['register'];
}) => (
  <label className={styles.toggleRow}>
    <div className={styles.toggleInfo}>
      <span className={styles.toggleLabel}>{label}</span>
    </div>
    <input type="checkbox" className={styles.toggle} {...register(name)} />
  </label>
);

export default OfferSettingsPage;
