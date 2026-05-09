import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '../Button/Button';

import styles from './ExcelExport.module.scss';

interface ExcelExportProps<T extends Record<string, unknown>> {
  data?: T[];
  onExportData?: () => Promise<T[]> | T[];
  filename?: string;
  sheetName?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export const ExcelExport = <T extends Record<string, unknown>>({
  data,
  onExportData,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
  buttonText = 'Export',
  variant = 'secondary',
  className = '',
  disabled = false,
}: ExcelExportProps<T>) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let exportData: T[] | undefined = data;

      if (onExportData) {
        exportData = await onExportData();
      }

      if (!exportData || exportData.length === 0) return;

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate buffer and trigger download
      XLSX.writeFile(workbook, filename);
    } catch {
      // Failed to export
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = disabled || isExporting || (!data?.length && !onExportData);

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={isDisabled}
      className={`${styles.exportButton} ${className}`}
    >
      {isExporting ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
      {buttonText}
    </Button>
  );
};
