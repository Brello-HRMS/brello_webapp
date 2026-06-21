import React, { useState } from 'react';
import { Pencil, X, Check, Building2, FileText, Hash, Globe } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/ui/Select/Select';
import { Button } from '../../../../components/ui/Button/Button';
import { useIndustryTypes } from '../../../auth/api/useIndustryTypes';
import { useUpdateOrgProfile } from '../../hooks';
import { getOrganizationId } from '../../../../utils/authUtils';

import styles from './OrgCompanyCard.module.scss';

import type { OrganizationProfile } from '../../types';

interface OrgCompanyCardProps {
  profile: OrganizationProfile;
}

interface FormState {
  name: string;
  registration_no: string;
  gst_no: string;
  domain: string;
  industry_type_id: string;
}

export const OrgCompanyCard: React.FC<OrgCompanyCardProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: profile.name,
    registration_no: profile.registration_no,
    gst_no: profile.gst_no ?? '',
    domain: profile.domain ?? '',
    industry_type_id: profile.industry_type_id ?? '',
  });

  const orgId = getOrganizationId() ?? '';
  const { mutate: updateProfile, isPending } = useUpdateOrgProfile(orgId);
  const { data: industryTypesRes } = useIndustryTypes();

  const industryOptions = [
    { value: '', label: 'Select industry' },
    ...(industryTypesRes?.data ?? []).map((it) => ({ value: it.id, label: it.name })),
  ];

  const handleEdit = () => {
    setForm({
      name: profile.name,
      registration_no: profile.registration_no,
      gst_no: profile.gst_no ?? '',
      domain: profile.domain ?? '',
      industry_type_id: profile.industry_type_id ?? '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(
      {
        profileId: profile.id,
        payload: {
          name: form.name,
          registration_no: form.registration_no,
          gst_no: form.gst_no || undefined,
          domain: form.domain || undefined,
          industry_type_id: form.industry_type_id || null,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const rows = [
    { icon: <Building2 size={18} />, label: 'Legal Name', value: profile.name },
    { icon: <FileText size={18} />, label: 'Registration No', value: profile.registration_no || '—' },
    { icon: <Hash size={18} />, label: 'GST Number', value: profile.gst_no || '—' },
    { icon: <Globe size={18} />, label: 'Website', value: profile.domain || '—' },
    {
      icon: <Building2 size={18} />,
      label: 'Industry',
      value: profile.industry_type?.name || '—',
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>Company Details</h3>
        {!isEditing && (
          <button className={styles.editBtn} onClick={handleEdit}>
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.form}>
          <Input
            label="Legal Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Registration No *"
            value={form.registration_no}
            onChange={(e) => setForm((f) => ({ ...f, registration_no: e.target.value }))}
          />
          <Input
            label="GST Number"
            value={form.gst_no}
            onChange={(e) => setForm((f) => ({ ...f, gst_no: e.target.value }))}
          />
          <Input
            label="Website"
            value={form.domain}
            placeholder="https://example.com"
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
          />
          <Select
            label="Industry"
            value={form.industry_type_id}
            options={industryOptions}
            onChange={(e) => setForm((f) => ({ ...f, industry_type_id: e.target.value }))}
          />
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
              <X size={14} /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending || !form.name || !form.registration_no}>
              <Check size={14} /> {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <div className={styles.icon}>{row.icon}</div>
              <div className={styles.content}>
                <span className={styles.label}>{row.label}</span>
                <span className={styles.value}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
