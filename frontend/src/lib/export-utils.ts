import { format } from 'date-fns';

export interface PredictionExportData {
  id: number;
  image_filename: string;
  prediction: string;
  confidence: number;
  model_name: string;
  created_at: string;
  patient_id?: string;
  patient_name?: string;
}

export function exportToCSV(data: PredictionExportData[], filename: string = 'predictions') {
  // Headers
  const headers = [
    'ID',
    'Image',
    'Prediction',
    'Confidence (%)',
    'Model',
    'Date',
    'Patient ID',
    'Patient Name'
  ];

  // Convert data to CSV rows
  const rows = data.map(pred => [
    pred.id,
    pred.image_filename,
    pred.prediction,
    pred.confidence.toFixed(2),
    pred.model_name,
    format(new Date(pred.created_at), 'yyyy-MM-dd HH:mm:ss'),
    pred.patient_id || 'N/A',
    pred.patient_name || 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: PredictionExportData[], filename: string = 'predictions') {
  // Create HTML table
  const headers = [
    'ID',
    'Image',
    'Prediction',
    'Confidence (%)',
    'Model',
    'Date',
    'Patient ID',
    'Patient Name'
  ];

  const htmlTable = `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${data.map(pred => `
          <tr>
            <td>${pred.id}</td>
            <td>${pred.image_filename}</td>
            <td>${pred.prediction}</td>
            <td>${pred.confidence.toFixed(2)}</td>
            <td>${pred.model_name}</td>
            <td>${format(new Date(pred.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
            <td>${pred.patient_id || 'N/A'}</td>
            <td>${pred.patient_name || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Create Excel file (using HTML table method)
  const blob = new Blob([htmlTable], { 
    type: 'application/vnd.ms-excel' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${Date.now()}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
