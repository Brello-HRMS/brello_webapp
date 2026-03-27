import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, X } from 'lucide-react';

import { Button, Select } from '../../../../../components/common';
import { Input } from '../../../../../components/ui/Input/Input';
import { useEmployeesDropdown } from '../../../../../hooks/useEmployees';
import { getInitials } from '../../../../../utils/stringUtils';
import { useProjectTeam } from '../../../hooks/useProjectTeam';
import styles from '../../AddProjectModal.module.scss';

import type { FieldArrayWithId, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { ProjectFormData } from '../../../schemas/projectSchema';

interface TeamMember {
  employee_id: string;
  role: string;
}

interface TeamTabProps {
  projectId?: string;
  setValue: UseFormSetValue<ProjectFormData>;
  watch: UseFormWatch<ProjectFormData>;
  fields: FieldArrayWithId<ProjectFormData, 'team'>[];
  append: (data: TeamMember) => void;
  remove: (index: number) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({
  projectId,
  setValue,
  watch,
  fields,
  append,
  remove,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ employee_id: '', role: '' });
  const selectedLeadId = watch('lead_id');

  const { data: employeesResponse } = useEmployeesDropdown();
  const { data: teamResponse, isLoading: isLoadingTeam } = useProjectTeam(projectId);

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse]);

  useEffect(() => {
    if (teamResponse?.data && fields.length === 0) {
      teamResponse.data.forEach((member) => {
        append({
          employee_id: member.user_id,
          role: member.role,
        });
      });
    }
  }, [teamResponse, append, fields.length]);

  const projectLeadOptions = useMemo(
    () =>
      employees.map((emp) => ({
        label: emp.name,
        value: emp.id,
      })),
    [employees],
  );

  const addMemberOptions = useMemo(() => {
    const assignedIds = new Set(fields.map((f) => f.employee_id));
    if (selectedLeadId) assignedIds.add(selectedLeadId);

    return employees
      .filter((emp) => !assignedIds.has(emp.id))
      .map((emp) => ({
        label: emp.name,
        value: emp.id,
      }));
  }, [employees, fields, selectedLeadId]);

  const handleAddMember = () => {
    if (newMember.employee_id && newMember.role) {
      append(newMember);
      setNewMember({ employee_id: '', role: '' });
      setShowAddMember(false);
    }
  };

  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={styles.teamSection}
    >
      <Select
        label="Project Lead"
        required
        options={projectLeadOptions}
        value={selectedLeadId}
        onChange={(val: string | number) => setValue('lead_id', val as string)}
        placeholder="Select project lead"
      />

      <div className={styles.sectionHeader}>
        <h4>Assign team members to this project</h4>
        <Button variant="secondary" onClick={() => setShowAddMember(true)} type="button">
          <Plus size={16} /> Add member
        </Button>
      </div>

      <div className={styles.memberList}>
        {isLoadingTeam ? (
          <div className={styles.loadingState}>
            <p>Loading team members...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.iconContainer}>
              <Users size={32} />
            </div>
            <p>No team members assigned yet</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const employee = employees.find((emp) => emp.id === field.employee_id);
            return (
              <div key={field.id} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  {employee?.profile ? (
                    <img src={employee.profile} alt={employee.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.initialsAvatar}>{getInitials(employee?.name || '')}</div>
                  )}
                  <div className={styles.details}>
                    <span className={styles.name}>{employee?.name || 'Unknown Employee'}</span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.role}>{field.role}</span>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => remove(index)} type="button">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {showAddMember && (
        <div className={styles.addMemberForm}>
          <button className={styles.closeBtn} onClick={() => setShowAddMember(false)} type="button">
            <X size={16} />
          </button>
          <Select
            label="Employee"
            required
            options={addMemberOptions}
            value={newMember.employee_id}
            onChange={(val: string | number) =>
              setNewMember((prev) => ({ ...prev, employee_id: val as string }))
            }
            placeholder="Select employee"
          />
          <Input
            label="Role"
            required
            placeholder="e.g., Developer"
            value={newMember.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMember((prev) => ({ ...prev, role: e.target.value }))
            }
          />
          <Button
            variant="primary"
            onClick={handleAddMember}
            disabled={!newMember.employee_id || !newMember.role}
            type="button"
          >
            Confirm
          </Button>
        </div>
      )}
    </motion.div>
  );
};
