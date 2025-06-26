import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { User, VitalSignsRecord } from '../../types';
import { MedicalReport } from './MedicalReport';
import { Button } from '../common/Button';
import { Download, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PdfExportButtonProps {
  user: User;
  record: VitalSignsRecord; // For exporting a single record
  // Could be extended to take an array of records for full history
  buttonText?: string;
  fileName?: string;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({ 
    user, 
    record, 
    buttonText = "Exportar a PDF",
    fileName = `BioMonitor_Reporte_${user.surname}_${user.name}_${new Date(record.date).toLocaleDateString('sv-SE')}.pdf`
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const reportId = `pdf-report-content-${record.id}`;

  const exportToPdf = async () => {
    setIsExporting(true);
    const reportElement = document.getElementById(reportId);

    if (reportElement) {
      try {
        // Use a slight delay to ensure content is fully rendered, especially if there are images/charts
        await new Promise(resolve => setTimeout(resolve, 200));

        const canvas = await html2canvas(reportElement, {
          scale: 2, // Improves quality
          useCORS: true, // If you have external images
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt', // points
          format: 'a4', // page format
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate the aspect ratio
        const ratio = canvasWidth / canvasHeight;
        let imgWidth = pdfWidth - 40; // With some margin
        let imgHeight = imgWidth / ratio;

        // If image height is too large for one page, scale it down
        if (imgHeight > pdfHeight - 40) {
          imgHeight = pdfHeight - 40;
          imgWidth = imgHeight * ratio;
        }
        
        // Center the image
        const x = (pdfWidth - imgWidth) / 2;
        const y = 20; // Top margin

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(fileName);

      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("No se pudo encontrar el contenido para exportar.");
    }
    setIsExporting(false);
  };

  return (
    <>
      {/* Hidden div for rendering the report content specifically for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1000px' }}> {/* Increased width from 800px to 1000px */}
         <MedicalReport user={user} record={record} idForPdf={reportId} />
      </div>
      <Button onClick={exportToPdf} disabled={isExporting} leftIcon={isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}>
        {isExporting ? "Exportando..." : buttonText}
      </Button>
      {isExporting && <LoadingSpinner text="Generando PDF, por favor espera..." size="sm" />}
    </>
  );
};