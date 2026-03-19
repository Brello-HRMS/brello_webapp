import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Dialog, Button, ToggleButton } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { LogoUpload } from '../LogoUpload/LogoUpload';
import { useAddClient } from '../../hooks/useAddClient';
import { useUpdateClient } from '../../hooks/useUpdateClient';
import { Status } from '../../../../types/common';

import styles from './AddClientModal.module.scss';

import type { Client } from '../../types/clientType';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  poc_name: z.string().min(1, 'POC name is required'),
  poc_email: z.string().email('Invalid email address'),
  poc_phone: z.string().min(1, 'POC phone is required'),
  address: z.string().min(1, 'Address is required'),
  isActive: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export const AddClientModal: React.FC<AddClientModalProps> = ({ open, onClose, client }) => {
  const [_logoFile, setLogoFile] = React.useState<File | null>(null);
  const { mutate: addClient, isPending: isAdding } = useAddClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const isPending = isAdding || isUpdating;
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      poc_name: '',
      poc_email: '',
      poc_phone: '',
      address: '',
      isActive: true,
    },
  });

  const isActive = useWatch({ control, name: 'isActive' });

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.name,
          poc_name: client.poc_name,
          poc_email: client.poc_email,
          poc_phone: client.poc_phone,
          address: client.address,
          isActive: client.status === Status.ACTIVE,
        });
      } else {
        reset({
          name: '',
          poc_name: '',
          poc_email: '',
          poc_phone: '',
          address: '',
          isActive: true,
        });
      }
    }
  }, [open, client, reset]);

  const onSubmit = (data: ClientFormValues) => {
    const payload = {
      name: data.name,
      poc_name: data.poc_name,
      poc_email: data.poc_email,
      poc_phone: data.poc_phone,
      address: data.address,
      status: data.isActive ? Status.ACTIVE : Status.INACTIVE,
    };

    if (isEdit && client) {
      updateClient(
        { id: client.id, params: payload },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      addClient(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  const actions = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        onClick={onClose}
        type="button"
        className={styles.cancelAction}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        type="submit"
        className={styles.saveAction}
        isLoading={isPending}
      >
        {isEdit ? 'Save changes' : 'Save Client'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Client' : 'Add Client'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
        <LogoUpload onLogoChange={setLogoFile} initialLogoUrl={client?.logo_url} />

        <div className={styles.formGroup}>
          <Input
            label="Client Name"
            required
            placeholder="e.g., General Office Policy"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Person of Contact Name"
            required
            placeholder="Full name"
            {...register('poc_name')}
            error={errors.poc_name?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Person of Contact Email"
            type="email"
            required
            placeholder="example@company.com"
            {...register('poc_email')}
            error={errors.poc_email?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Person of Contact Phone"
            type="tel"
            required
            placeholder="+91"
            {...register('poc_phone')}
            error={errors.poc_phone?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <TextArea
            label="Address"
            required
            placeholder="Enter full street address, city and zip code"
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        <div className={styles.statusRow}>
          <div>
            <label className={styles.statusLabel}>Status</label>
            <span className={styles.statusSubLabel}>Set the initial visibility state</span>
          </div>
          <div className={styles.toggleContainer}>
            <ToggleButton
              label={isActive ? 'Active' : 'Inactive'}
              checked={isActive}
              onChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};
