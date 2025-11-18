// frontend/src/lib/pdf-export.ts

import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PredictionData {
  result: {
    prediction: string;
    is_parasitized: boolean;
    confidence: number;
    probability_parasitized: number;
    probability_uninfected: number;
    model_name: string;
    inference_time_ms?: number;
  };
  image_filename: string;
  created_at?: string;
  patient_info?: {
    name?: string;
    id?: string;
    age?: number;
  };
}

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async exportPrediction(data: PredictionData, imageData?: string) {
    this.addHeader();
    this.addPatientInfo(data);
    
    if (imageData) {
      await this.addImage(imageData);
    }
    
    this.addResults(data);
    this.addInterpretation(data);
    this.addRecommendations(data);
    this.addFooter();

    // Download
    const filename = `malaria-report-${Date.now()}.pdf`;
    this.doc.save(filename);
  }

  private addHeader() {
    // Logo (placeholder - you can add actual logo)
    this.doc.setFillColor(59, 130, 246); // primary blue
    this.doc.circle(this.margin + 10, this.currentY + 10, 8, 'F');
    
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MALARIA DETECTION REPORT', this.margin + 25, this.currentY + 12);
    
    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('AI-Powered Blood Cell Analysis', this.margin + 25, this.currentY + 18);
    
    // Date
    this.doc.setFontSize(9);
    this.doc.text(
      `Report Date: ${format(new Date(), 'PPP')}`,
      this.pageWidth - this.margin - 50,
      this.currentY + 12
    );
    
    // Line
    this.currentY += 30;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addPatientInfo(data: PredictionData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Patient Information', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (data.patient_info?.name) {
      this.doc.text(`Name: ${data.patient_info.name}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    }
    
    if (data.patient_info?.id) {
      this.doc.text(`Patient ID: ${data.patient_info.id}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    }
    
    if (data.patient_info?.age) {
      this.doc.text(`Age: ${data.patient_info.age} years`, this.margin + 5, this.currentY);
      this.currentY += 6;
    }

    this.doc.text(`Sample ID: ${data.image_filename}`, this.margin + 5, this.currentY);
    this.currentY += 10;
  }

  private async addImage(imageData: string) {
    try {
      const imgWidth = 80;
      const imgHeight = 80;
      const x = (this.pageWidth - imgWidth) / 2;
      
      this.doc.addImage(imageData, 'PNG', x, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  private addResults(data: PredictionData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Analysis Results', this.margin, this.currentY);
    this.currentY += 8;

    // Result box
    const boxHeight = 40;
    const boxY = this.currentY;
    
    if (data.result.is_parasitized) {
      this.doc.setFillColor(239, 68, 68); // red
    } else {
      this.doc.setFillColor(34, 197, 94); // green
    }
    
    this.doc.roundedRect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 3, 3, 'F');
    
    // Result text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      data.result.prediction.toUpperCase(),
      this.pageWidth / 2,
      boxY + 15,
      { align: 'center' }
    );
    
    this.doc.setFontSize(14);
    this.doc.text(
      `Confidence: ${data.result.confidence.toFixed(2)}%`,
      this.pageWidth / 2,
      boxY + 28,
      { align: 'center' }
    );
    
    this.currentY += boxHeight + 10;
    this.doc.setTextColor(0, 0, 0);

    // Detailed probabilities
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Analysis:', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Parasitized probability
    this.doc.text('Parasitized:', this.margin + 5, this.currentY);
    this.doc.text(
      `${data.result.probability_parasitized.toFixed(2)}%`,
      this.pageWidth - this.margin - 30,
      this.currentY
    );
    this.currentY += 6;
    
    // Progress bar
    this.drawProgressBar(
      data.result.probability_parasitized,
      this.margin + 5,
      this.currentY,
      this.pageWidth - 2 * this.margin - 10,
      239, 68, 68
    );
    this.currentY += 10;

    // Uninfected probability
    this.doc.text('Uninfected:', this.margin + 5, this.currentY);
    this.doc.text(
      `${data.result.probability_uninfected.toFixed(2)}%`,
      this.pageWidth - this.margin - 30,
      this.currentY
    );
    this.currentY += 6;
    
    this.drawProgressBar(
      data.result.probability_uninfected,
      this.margin + 5,
      this.currentY,
      this.pageWidth - 2 * this.margin - 10,
      34, 197, 94
    );
    this.currentY += 15;

    // Model info
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Model: ${data.result.model_name}`, this.margin + 5, this.currentY);
    if (data.result.inference_time_ms) {
      this.doc.text(
        `Processing Time: ${data.result.inference_time_ms.toFixed(0)}ms`,
        this.pageWidth - this.margin - 40,
        this.currentY
      );
    }
    this.currentY += 10;
    this.doc.setTextColor(0, 0, 0);
  }

  private drawProgressBar(
    percentage: number,
    x: number,
    y: number,
    width: number,
    r: number,
    g: number,
    b: number
  ) {
    const barHeight = 4;
    
    // Background
    this.doc.setFillColor(220, 220, 220);
    this.doc.roundedRect(x, y, width, barHeight, 2, 2, 'F');
    
    // Fill
    const fillWidth = (width * percentage) / 100;
    this.doc.setFillColor(r, g, b);
    this.doc.roundedRect(x, y, fillWidth, barHeight, 2, 2, 'F');
  }

  private addInterpretation(data: PredictionData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Clinical Interpretation', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const interpretation = data.result.is_parasitized
      ? 'The AI analysis indicates the presence of malaria parasites in the blood sample. ' +
        'This preliminary result suggests a positive malaria infection.'
      : 'The AI analysis shows no evidence of malaria parasites in the blood sample. ' +
        'This preliminary result suggests no malaria infection.';
    
    const lines = this.doc.splitTextToSize(interpretation, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(lines, this.margin + 5, this.currentY);
    this.currentY += lines.length * 6 + 10;
  }

  private addRecommendations(data: PredictionData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recommendations', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const recommendations = data.result.is_parasitized
      ? [
          '1. Immediate consultation with a healthcare provider is recommended',
          '2. Microscopic confirmation by a trained technician should be performed',
          '3. Begin appropriate antimalarial treatment as prescribed',
          '4. Monitor symptoms and follow up as directed by healthcare provider',
          '5. Take preventive measures to avoid further mosquito bites'
        ]
      : [
          '1. Continue routine health monitoring',
          '2. If symptoms persist, consult a healthcare provider',
          '3. Maintain preventive measures against mosquito bites',
          '4. Consider follow-up testing if exposed to malaria risk areas',
          '5. Stay informed about malaria prevention guidelines'
        ];

    recommendations.forEach((rec) => {
      const lines = this.doc.splitTextToSize(rec, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(lines, this.margin + 5, this.currentY);
      this.currentY += lines.length * 6;
    });

    this.currentY += 10;

    // Important note
    this.doc.setFillColor(255, 243, 205); // yellow background
    const noteHeight = 20;
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      noteHeight,
      2,
      2,
      'F'
    );
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('IMPORTANT NOTE:', this.margin + 5, this.currentY + 6);
    this.doc.setFont('helvetica', 'normal');
    const note = 'This is an AI-assisted preliminary analysis and should not replace professional medical diagnosis.';
    const noteLines = this.doc.splitTextToSize(note, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(noteLines, this.margin + 5, this.currentY + 12);
    
    this.currentY += noteHeight + 10;
  }

  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      'Malaria Detection Platform - M1 DSGL UADB',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    this.doc.text(
      `Generated on ${format(new Date(), 'PPP p')}`,
      this.pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
  }
}

// Export function
export async function exportPredictionToPDF(data: PredictionData, imageData?: string) {
  const pdfService = new PDFExportService();
  await pdfService.exportPrediction(data, imageData);
}