import PDFDocument from 'pdfkit';

export interface MeetingPdfData {
  title: string;
  summary: string;
  sentiment: string;
  keyPoints: string[];
  followUpEmail: string;
  topics: string[];
  tasks: Array<{
    task: string;
    owner: string;
    deadline: string;
    priority: string;
    completed: boolean;
  }>;
}

export async function generateMeetingPdf(data: MeetingPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Branding & Header
    doc
      .fillColor('#F59E0B')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('NoteGenius', 50, 50);
      
    doc
      .fillColor('#94a3b8')
      .fontSize(10)
      .font('Helvetica')
      .text('Intelligence Report', 50, 80);

    doc.moveDown(2);

    // Title
    doc
      .fillColor('#0f172a')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text(data.title, { underline: true });

    doc.moveDown(1);
    
    // Summary Section
    doc
      .fillColor('#F59E0B')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Executive Summary');
      
    doc.moveDown(0.5);
    
    doc
      .fillColor('#334155')
      .fontSize(11)
      .font('Helvetica')
      .text(data.summary, { lineGap: 4 });

    doc.moveDown(2);

    // Key Points
    doc
      .fillColor('#F59E0B')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Key Discussion Points');
    
    doc.moveDown(0.5);
    
    data.keyPoints.forEach((point, i) => {
      doc
        .fillColor('#334155')
        .fontSize(11)
        .font('Helvetica')
        .text(`${i + 1}. ${point}`, { indent: 10, lineGap: 3 });
    });

    doc.moveDown(2);

    // Action Items Table
    doc
      .fillColor('#F59E0B')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Action Items & Task Extraction');
    
    doc.moveDown(0.5);

    // Table "Headers"
    const startY = doc.y;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#94a3b8');
    doc.text('Task', 60, startY);
    doc.text('Owner', 300, startY);
    doc.text('Deadline', 400, startY);
    doc.text('Priority', 480, startY);
    
    doc.moveDown(0.5);
    doc.strokeColor('#f1f5f9').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10).fillColor('#334155');
    data.tasks.forEach((task) => {
      const currentY = doc.y;
      
      doc.text(task.task, 60, currentY, { width: 230 });
      doc.text(task.owner, 300, currentY);
      doc.text(task.deadline, 400, currentY);
      
      const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#64748b';
      doc.fillColor(priorityColor).font('Helvetica-Bold').text(task.priority.toUpperCase(), 480, currentY);
      doc.fillColor('#334155').font('Helvetica');

      doc.moveDown(1.5);
    });

    doc.moveDown(2);

    // Follow-up Email
    doc
      .fillColor('#F59E0B')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Generated Follow-up Draft');
    
    doc.moveDown(0.5);
    
    doc
      .fillColor('#475569')
      .fontSize(10)
      .font('Helvetica-Oblique')
      .rect(50, doc.y, 500, 150) // Background rect for email area (simplified)
      .text(data.followUpEmail, { 
        lineGap: 4,
        width: 480
      });

    doc.end();
  });
}
