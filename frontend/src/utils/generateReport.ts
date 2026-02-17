import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { SchedulerResult } from '../types/simulation';

interface GenerateReportOptions {
    data: SchedulerResult;
    ganttRef?: HTMLElement | null;
}

export async function generatePDFReport({ data, ganttRef }: GenerateReportOptions): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
            return true;
        }
        return false;
    };

    // ============================================
    // TITLE
    // ============================================
    doc.setFontSize(24);
    doc.setTextColor(20, 184, 166); // Teal color
    doc.text('OBSYS Simulation Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // ============================================
    // SECTION 1: SIMULATION OVERVIEW
    // ============================================
    checkPageBreak(40);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('1. Simulation Overview', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const overviewData = [
        ['Algorithm Used', data.algorithm],
        ['Total Processes', data.processes.length.toString()],
        ['Total Execution Time', `${data.system_time} ms`],
        ['CPU Utilization', `${data.cpu_utilization.toFixed(2)}%`],
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: overviewData,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ============================================
    // SECTION 2: PROCESS TABLE
    // ============================================
    checkPageBreak(60);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('2. Process Details', 14, yPosition);
    yPosition += 10;

    const processTableData = data.processes.map((proc) => [
        proc.pid,
        proc.arrival_time.toString(),
        proc.burst_time.toString(),
        proc.start_time.toString(),
        proc.finish_time.toString(),
        proc.waiting_time.toString(),
        proc.turnaround_time.toString(),
    ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['PID', 'Arrival', 'Burst', 'Start', 'Finish', 'Waiting', 'TAT']],
        body: processTableData,
        theme: 'striped',
        headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255] },
        styles: { fontSize: 9, halign: 'center' },
        columnStyles: {
            0: { fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ============================================
    // SECTION 3: PERFORMANCE METRICS
    // ============================================
    checkPageBreak(50);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('3. Performance Metrics', 14, yPosition);
    yPosition += 10;

    const throughput = (data.processes.length / data.system_time * 1000).toFixed(2);

    const metricsData = [
        ['Average Waiting Time', `${data.avg_waiting_time.toFixed(2)} ms`],
        ['Average Turnaround Time', `${data.avg_turnaround_time.toFixed(2)} ms`],
        ['Throughput', `${throughput} processes/second`],
        ['CPU Utilization', `${data.cpu_utilization.toFixed(2)}%`],
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ============================================
    // SECTION 4: GANTT TIMELINE (Screenshot)
    // ============================================
    if (ganttRef) {
        checkPageBreak(100);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('4. Gantt Timeline', 14, yPosition);
        yPosition += 10;

        try {
            // Capture Gantt chart as image
            const canvas = await html2canvas(ganttRef, {
                backgroundColor: '#0f1420',
                scale: 2, // Higher quality
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 28; // Margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Check if image fits on current page
            if (yPosition + imgHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text('4. Gantt Timeline (continued)', 14, yPosition);
                yPosition += 10;
            }

            doc.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
        } catch (error) {
            console.error('Failed to capture Gantt chart:', error);
            doc.setFontSize(10);
            doc.setTextColor(200, 0, 0);
            doc.text('Error: Could not capture Gantt chart screenshot', 14, yPosition);
        }
    }

    // ============================================
    // FOOTER (on last page)
    // ============================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${totalPages} | OBSYS Framework`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // ============================================
    // SAVE PDF
    // ============================================
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `obsys_report_${data.algorithm.toLowerCase()}_${timestamp}.pdf`;

    doc.save(filename);
}
