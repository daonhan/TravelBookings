import { useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

interface CsvColumn {
  /** Key to extract from each data row. */
  key: string;
  /** Header label for the CSV column. */
  header: string;
}

interface CsvExportButtonProps {
  /** Column definitions mapping data keys to CSV headers. */
  columns: CsvColumn[];
  /** Array of data rows to export. */
  data: Record<string, unknown>[];
  /** Name of the downloaded CSV file (without extension). */
  filename: string;
}

function escapeCsvCell(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCsv(columns: CsvColumn[], data: Record<string, unknown>[]): string {
  const headerRow = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const dataRows = data.map((row) =>
    columns.map((col) => escapeCsvCell(row[col.key])).join(','),
  );
  return [headerRow, ...dataRows].join('\r\n');
}

function downloadBlob(content: string, filename: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function CsvExportButton({ columns, data, filename }: CsvExportButtonProps) {
  const { t } = useTranslation('reports');

  const handleExport = useCallback(() => {
    const csvContent = generateCsv(columns, data);
    downloadBlob(csvContent, filename);
  }, [columns, data, filename]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
      aria-label={t('csvExport.ariaLabel', 'Export data as CSV')}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {t('csvExport.label', 'Export CSV')}
    </Button>
  );
}
