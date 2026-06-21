import React, { useState } from 'react';
import { Pencil, X, Check, MapPin } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { Button } from '../../../../components/ui/Button/Button';
import { useUpdateOrgProfile } from '../../hooks';
import { getOrganizationId } from '../../../../utils/authUtils';

import styles from './OrgAddressCard.module.scss';

import type { OrganizationProfile } from '../../types';

interface OrgAddressCardProps {
  profile: OrganizationProfile;
}

interface FormState {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

const formatAddress = (profile: OrganizationProfile): string => {
  const parts = [
    profile.address,
    profile.city,
    profile.state,
    profile.zip_code,
    profile.country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

export const OrgAddressCard: React.FC<OrgAddressCardProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    address: profile.address ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    zip_code: profile.zip_code ?? '',
    country: profile.country ?? '',
  });

  const orgId = getOrganizationId() ?? '';
  const { mutate: updateProfile, isPending } = useUpdateOrgProfile(orgId);

  const handleEdit = () => {
    setForm({
      address: profile.address ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      zip_code: profile.zip_code ?? '',
      country: profile.country ?? '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(
      {
        profileId: profile.id,
        payload: {
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip_code: form.zip_code || undefined,
          country: form.country || undefined,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>Address</h3>
        {!isEditing && (
          <button className={styles.editBtn} onClick={handleEdit}>
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.form}>
          <Input
            label="Street Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <div className={styles.row2}>
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            />
          </div>
          <div className={styles.row2}>
            <Input
              label="ZIP Code"
              value={form.zip_code}
              onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value }))}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
              <X size={14} /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Check size={14} /> {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.rowView}>
            <div className={styles.icon}><MapPin size={18} /></div>
            <div className={styles.content}>
              <span className={styles.label}>Full Address</span>
              <span className={styles.value}>{formatAddress(profile)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
