import React from 'react';
import { Plus } from 'lucide-react';

import { PageHeader } from '../../../../components/common/PageHeader/PageHeader';
import { Button } from '../../../../components/common/Button/Button';
import styles from '../TimesheetPage.module.scss';

import { ExportMenu } from './ExportMenu';

import type { TimesheetEntryData, ProjectData } from './ProjectHoursTable';

interface TimesheetHeaderProps {
  entries: TimesheetEntryData[];
  projects: ProjectData[];
  selectedProjectId?: string;
  startDate?: string;
  endDate?: string;
  onAddClick: () => void;
}

export const TimesheetHeader: React.FC<TimesheetHeaderProps> = ({
  entries,
  projects,
  selectedProjectId,
  startDate,
  endDate,
  onAddClick,
}) => {
  return (
    <PageHeader
      title="Timesheets"
      subtitle="Track employee hours, projects, and work description logs."
      actions={
        <div className={styles.headerActions}>
          <ExportMenu
            entries={entries}
            projects={projects}
            selectedProjectId={selectedProjectId}
            startDate={startDate}
            endDate={endDate}
          />
          <Button onClick={onAddClick} variant="primary" className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Entry</span>
          </Button>
        </div>
      }
    />
  );
};
