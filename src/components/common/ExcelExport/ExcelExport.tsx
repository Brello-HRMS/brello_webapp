import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '../Button/Button';

import styles from './ExcelExport.module.scss';

interface ExcelExportProps<T extends Record<string, unknown>> {
  data: T[];
  filename?: string;
  sheetName?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export const ExcelExport = <T extends Record<string, unknown>>({
  data,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
  buttonText = 'Export',
  variant = 'secondary',
  className = '',
  disabled = false,
}: ExcelExportProps<T>) => {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer and trigger download
    XLSX.writeFile(workbook, filename);
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className={`${styles.exportButton} ${className}`}
    >
      <Download size={16} />
      {buttonText}
    </Button>
  );
};
