import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Popover } from '../../../../components/common/Popover/Popover';
import { Button } from '../../../../components/common/Button/Button';

import type { TimesheetEntryData, ProjectData } from './ProjectHoursTable';

interface ExportMenuProps {
  entries: TimesheetEntryData[];
  projects: ProjectData[];
  selectedProjectId?: string;
  startDate?: string;
  endDate?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  entries,
  projects,
  selectedProjectId,
  startDate,
  endDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerExport = (dataToExport: TimesheetEntryData[], filename: string) => {
    if (dataToExport.length === 0) {
      alert('No timesheet entries found for this export selection.');
      return;
    }

    const formattedData = dataToExport.map((e) => ({
      Project: e.projectName,
      Date: e.date,
      'Start Time': e.startTime,
      'End Time': e.endTime,
      'Total Hours': e.hours,
      'Task Description': e.description,
      Status: e.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');
    XLSX.writeFile(workbook, filename);
  };

  const getFilteredProjectEntries = () => {
    if (!selectedProjectId) return [];
    return entries.filter((e) => e.projectId === selectedProjectId);
  };

  const getFilteredDateEntries = () => {
    if (!startDate || !endDate) return [];
    return entries.filter((e) => {
      const entryDate = e.date;
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const currentProjectName = projects.find((p) => p.id === selectedProjectId)?.name || 'Project';

  const menuItems = [
    {
      icon: <FileSpreadsheet size={16} />,
      title: `Export Current Project (${currentProjectName})`,
      disabled: !selectedProjectId || getFilteredProjectEntries().length === 0,
      action: () => {
        const data = getFilteredProjectEntries();
        triggerExport(
          data,
          `${currentProjectName.toLowerCase().replace(/\s+/g, '_')}_timesheet.xlsx`,
        );
      },
    },
    {
      icon: <FileSpreadsheet size={16} />,
      title: 'Export All Projects Together',
      disabled: entries.length === 0,
      action: () => {
        triggerExport(entries, 'all_projects_timesheet.xlsx');
      },
    },
    {
      icon: <FileSpreadsheet size={16} />,
      title:
        startDate && endDate
          ? `Export Range (${startDate} to ${endDate})`
          : 'Export by Selected Date Range',
      disabled: !startDate || !endDate || getFilteredDateEntries().length === 0,
      action: () => {
        const data = getFilteredDateEntries();
        triggerExport(data, `timesheet_${startDate}_to_${endDate}.xlsx`);
      },
    },
  ];

  return (
    <Popover
      trigger={
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          <span>Export Options</span>
        </Button>
      }
      items={menuItems}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      dropdownClassName="right-0 mt-2"
    />
  );
};
