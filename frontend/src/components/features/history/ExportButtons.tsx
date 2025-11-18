
'use client';

import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel, PredictionExportData } from '@/lib/export-utils';
import { toast } from 'sonner';

interface ExportButtonsProps {
  data: PredictionExportData[];
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(data, 'malaria-predictions');
    toast.success('CSV exported successfully!');
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToExcel(data, 'malaria-predictions');
    toast.success('Excel file exported successfully!');
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={handleExportExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}