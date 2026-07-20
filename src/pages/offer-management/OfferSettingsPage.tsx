import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller, type Control } from 'react-hook-form';
import { PlusCircle, Trash2 } from 'lucide-react';

import { Button, PageHeader, ToggleButton } from '../../components/common';
import {
  useOfferSettings,
  useUpdateOfferSettings,
} from '../../features/offer-management/hooks/useOffers';

import styles from './OfferSettingsPage.module.scss';

import type { UpdateOfferSettingsParams } from '../../features/offer-management/types/offerTypes';

type Tab = 'general' | 'portal' | 'documents';

const OfferSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { data: response, isLoading } = useOfferSettings();
  const settings = response?.data;
  const { mutate: updateSettings, isPending } = useUpdateOfferSettings();

  const { register, handleSubmit, reset, control } = useForm<UpdateOfferSettingsParams>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'required_onboarding_documents',
  });

  useEffect(() => {
    if (settings) {
      reset({
        offer_prefix: settings.offer_prefix,
        offer_expiry_days: settings.offer_expiry_days,
        allow_download: settings.allow_download,
        enable_request_changes: settings.enable_request_changes,
        enable_digital_signature: settings.enable_digital_signature,
        auto_welcome_email: settings.auto_welcome_email,
        required_onboarding_documents: settings.required_onboarding_documents || [],
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: UpdateOfferSettingsParams) => {
    updateSettings(data);
  };

  if (isLoading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        title="Offer Settings"
        subtitle="Configure default behaviour and rules for the offer management module."
        actions={
          <Button type="submit" form="offer-settings-form" variant="primary" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        }
      />

      <div className={styles.tabsWrapper}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('general')}
          type="button"
        >
          General
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'portal' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('portal')}
          type="button"
        >
          Candidate Portal
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('documents')}
          type="button"
        >
          Documents
        </button>
      </div>

      <form id="offer-settings-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.card}>
          {activeTab === 'general' && (
            <div className={styles.tabContent}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>General Rules</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Offer Number Prefix<span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      {...register('offer_prefix')}
                      placeholder="OFF"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Offer Expiry (days)<span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      {...register('offer_expiry_days', { valueAsNumber: true })}
                      placeholder="7"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portal' && (
            <div className={styles.tabContent}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Candidate Portal Experience</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.toggleList}>
                  <ToggleField
                    label="Allow candidates to download the offer PDF"
                    name="allow_download"
                    control={control}
                  />
                  <ToggleField
                    label="Enable candidates to request changes (counter-offer)"
                    name="enable_request_changes"
                    control={control}
                  />
                  <ToggleField
                    label="Embed digital signature in the offer PDF"
                    name="enable_digital_signature"
                    control={control}
                  />
                  <ToggleField
                    label="Send welcome email automatically on acceptance"
                    name="auto_welcome_email"
                    control={control}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className={styles.tabContent}>
              <div className={styles.cardHeaderBetween}>
                <h3 className={styles.cardTitle}>Required Onboarding Documents</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', is_required: true, description: '' })}
                  type="button"
                  className={styles.addBtn}
                >
                  <PlusCircle size={14} style={{ marginRight: 4 }} /> Add Document
                </Button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.documentList}>
                  {fields.map((field, index) => (
                    <div key={field.id} className={styles.documentRow}>
                      <div className={styles.field} style={{ flex: 1 }}>
                        <input
                          className={styles.input}
                          {...register(`required_onboarding_documents.${index}.name`)}
                          placeholder="Document Name (e.g. Aadhaar Card)"
                          required
                        />
                      </div>
                      <div className={styles.field} style={{ flex: 2 }}>
                        <input
                          className={styles.input}
                          {...register(`required_onboarding_documents.${index}.description`)}
                          placeholder="Optional Description"
                        />
                      </div>
                      <label className={styles.requiredCheckbox}>
                        <input
                          type="checkbox"
                          {...register(`required_onboarding_documents.${index}.is_required`)}
                        />
                        <span>Required</span>
                      </label>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => remove(index)}
                        title="Remove document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className={styles.emptyState}>No required documents configured yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const ToggleField = ({
  label,
  name,
  control,
}: {
  label: string;
  name: keyof UpdateOfferSettingsParams;
  control: Control<UpdateOfferSettingsParams>;
}) => (
  <label className={styles.toggleRow}>
    <div className={styles.toggleInfo}>
      <span className={styles.toggleLabel}>{label}</span>
    </div>
    <Controller
      name={name}
      control={control}
      render={({ field }) => <ToggleButton checked={!!field.value} onChange={field.onChange} />}
    />
  </label>
);

export default OfferSettingsPage;
