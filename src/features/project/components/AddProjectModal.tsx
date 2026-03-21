import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';

import { Dialog, Button } from '../../../components/common';
import { useCreateProject } from '../hooks/useCreateProject';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';

import styles from './AddProjectModal.module.scss';
import { BasicInfoTab } from './AddProjectModal/Tabs/BasicInfoTab';
import { TeamTab } from './AddProjectModal/Tabs/TeamTab';
import { ContractTab } from './AddProjectModal/Tabs/ContractTab';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

type TabType = 'basic' | 'team' | 'contract';

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, clientId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const createProject = useCreateProject(clientId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'DRAFT',
      priority: 'Medium',
      team: [],
      contracts: [],
    },
  });

  const {
    fields: teamFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: 'team',
  });

  const {
    fields: contractFields,
    append: appendContract,
    remove: removeContract,
  } = useFieldArray({
    control,
    name: 'contracts',
  });

  const onSubmit = (data: ProjectFormData) => {
    createProject.mutate(
      {
        ...data,
        client_id: clientId,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const actions = (
    <div className={styles.modalFooter}>
      <Button variant="secondary" onClick={onClose} type="button" className={styles.cancelAction}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        isLoading={createProject.isPending}
        className={styles.saveAction}
      >
        Create project
      </Button>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Add New Project"
      maxWidth="500px"
      actions={actions}
      position="right"
    >
      <div className={styles.modalContent}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Basic Info
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'team' ? styles.active : ''}`}
            onClick={() => setActiveTab('team')}
            type="button"
          >
            Team
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'contract' ? styles.active : ''}`}
            onClick={() => setActiveTab('contract')}
            type="button"
          >
            Contract
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <BasicInfoTab
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          )}
          {activeTab === 'team' && (
            <TeamTab
              setValue={setValue}
              watch={watch}
              fields={teamFields}
              append={appendMember}
              remove={removeMember}
            />
          )}
          {activeTab === 'contract' && (
            <ContractTab fields={contractFields} append={appendContract} remove={removeContract} />
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  );
};
