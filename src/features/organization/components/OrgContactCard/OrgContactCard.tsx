import React, { useState } from 'react';
import { Pencil, X, Check, Mail, Phone } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { Button } from '../../../../components/ui/Button/Button';
import { useUpdateOrgProfile } from '../../hooks';
import { getOrganizationId } from '../../../../utils/authUtils';

import styles from './OrgContactCard.module.scss';

import type { OrganizationProfile } from '../../types';

interface OrgContactCardProps {
  profile: OrganizationProfile;
}

interface FormState {
  email: string;
  phone: string;
}

export const OrgContactCard: React.FC<OrgContactCardProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({ email: profile.email, phone: profile.phone });

  const orgId = getOrganizationId() ?? '';
  const { mutate: updateProfile, isPending } = useUpdateOrgProfile(orgId);

  const handleEdit = () => {
    setForm({ email: profile.email, phone: profile.phone });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(
      { profileId: profile.id, payload: { email: form.email, phone: form.phone } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>Contact Info</h3>
        {!isEditing && (
          <button className={styles.editBtn} onClick={handleEdit}>
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.form}>
          <Input
            label="Official Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone *"
            type="tel"
            value={form.phone}
            placeholder="+91XXXXXXXXXX"
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              <X size={14} /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !form.email || !form.phone}
            >
              <Check size={14} /> {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.icon}>
              <Mail size={18} />
            </div>
            <div className={styles.content}>
              <span className={styles.label}>Official Email</span>
              <span className={styles.value}>{profile.email}</span>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.icon}>
              <Phone size={18} />
            </div>
            <div className={styles.content}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{profile.phone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
