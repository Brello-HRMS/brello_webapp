import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, X } from 'lucide-react';

import { Button, Select } from '../../../../../components/common';
import { Input } from '../../../../../components/ui/Input/Input';
import { useEmployeesDropdown } from '../../../../../hooks/useEmployees';
import { getInitials } from '../../../../../utils/stringUtils';
import { useProjectTeam } from '../../../hooks/useProjectTeam';
import styles from '../../AddProjectModal.module.scss';

import type { FieldArrayWithId, UseFormWatch } from 'react-hook-form';
import type { ProjectFormData } from '../../../schemas/projectSchema';

interface TeamMember {
  user_id: string;
  role: string;
  is_lead?: boolean;
}

interface TeamTabProps {
  projectId?: string;
  watch: UseFormWatch<ProjectFormData>;
  teamMembers: FieldArrayWithId<ProjectFormData, 'team'>[];
  appendMember: (data: TeamMember) => void;
  removeMember: (index: number) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({
  projectId,
  watch,
  teamMembers,
  appendMember,
  removeMember,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState({ user_id: '', role: '', is_lead: false });
  const watchedTeam = watch('team');
  const selectedLead = useMemo(() => (watchedTeam || []).find((m) => m.is_lead), [watchedTeam]);
  const selectedLeadId = selectedLead?.user_id || '';

  const { data: employeesResponse } = useEmployeesDropdown();
  const { data: teamResponse, isLoading: isLoadingTeam } = useProjectTeam(projectId);

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse]);

  useEffect(() => {
    if (teamResponse?.data && teamMembers.length === 0) {
      teamResponse.data.forEach((member) => {
        appendMember({
          user_id: member.user_id,
          role: member.role,
          is_lead: member.is_lead ?? false,
        });
      });
    }
  }, [teamResponse, appendMember, teamMembers.length]);

  const projectLeadOptions = useMemo(
    () =>
      employees.map((emp) => ({
        label: emp.name,
        value: emp.id,
      })),
    [employees],
  );

  const addMemberOptions = useMemo(() => {
    const assignedIds = new Set(teamMembers.map((f) => f.user_id));

    return employees
      .filter((emp) => !assignedIds.has(emp.id))
      .map((emp) => ({
        label: emp.name,
        value: emp.id,
      }));
  }, [employees, teamMembers]);

  const handleAddMember = () => {
    if (addingMember.user_id && addingMember.role) {
      appendMember(addingMember);
      setAddingMember({ user_id: '', role: '', is_lead: false });
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
        onChange={(val: string | number) => {
          const newLeadId = val as string;

          // Find if there's already a lead and remove them
          const existingLeadIndex = teamMembers.findIndex((f) => f.is_lead);
          if (existingLeadIndex !== -1) {
            removeMember(existingLeadIndex);
          }

          // Add new lead to the team list
          appendMember({
            user_id: newLeadId,
            role: 'Project Lead',
            is_lead: true,
          });
        }}
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
        ) : teamMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.iconContainer}>
              <Users size={32} />
            </div>
            <p>No team members assigned yet</p>
          </div>
        ) : (
          teamMembers
            .filter((member) => !member.is_lead)
            .map((member, index) => {
              const employee = employees.find((emp) => emp.id === member.user_id);
              return (
                <div key={member.id} className={styles.memberRow}>
                  <div className={styles.memberInfo}>
                    {employee?.profile ? (
                      <img src={employee.profile} alt={employee.name} className={styles.avatar} />
                    ) : (
                      <div className={styles.initialsAvatar}>
                        {getInitials(employee?.name || '')}
                      </div>
                    )}
                    <div className={styles.details}>
                      <span className={styles.name}>{employee?.name || 'Unknown Employee'}</span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.role}>{member.role}</span>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeMember(index)}
                    type="button"
                  >
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
            value={addingMember.user_id}
            onChange={(val: string | number) =>
              setAddingMember((prev) => ({ ...prev, user_id: val as string }))
            }
            placeholder="Select employee"
          />
          <Input
            label="Role"
            required
            placeholder="e.g., Developer"
            value={addingMember.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAddingMember((prev) => ({ ...prev, role: e.target.value }))
            }
          />
          <Button
            variant="primary"
            onClick={handleAddMember}
            disabled={!addingMember.user_id || !addingMember.role}
            type="button"
          >
            Confirm
          </Button>
        </div>
      )}
    </motion.div>
  );
};
