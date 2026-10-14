import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ReceiptData {
  receiptNumber: string;
  societyName: string;
  unitNumber: string;
  residentName: string;
  billingPeriod: string;
  areaSqFt: number;
  sqFtRate: number;
  fixedCharge: number;
  variableCharge: number;
  totalPaid: number;
  paymentMethod: string;
  utrNumber: string;
  paidAt: Date;
  verifiedAt: Date;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<string> {
  const receiptsDir = path.resolve(__dirname, '../../uploads/receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const fileName = `receipt-${data.receiptNumber}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header Background Accent
    doc.rect(0, 0, 595.28, 90).fill('#0f172a');

    // Society Header
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(data.societyName, 50, 25);
    doc.fontSize(11).font('Helvetica').fillColor('#94a3b8').text('Resident Welfare Association • Official Payment Receipt', 50, 55);

    // Receipt Badge
    doc.roundedRect(420, 25, 125, 40, 4).fill('#1e293b');
    doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('RECEIPT NO', 430, 32);
    doc.fillColor('#ffffff').fontSize(11).text(data.receiptNumber, 430, 46);

    // Meta details section
    const startY = 120;
    doc.rect(50, startY, 495, 75).fillAndStroke('#f8fafc', '#e2e8f0');

    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('FLAT / UNIT', 65, startY + 12);
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`Flat ${data.unitNumber}`, 65, startY + 28);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('RESIDENT NAME', 190, startY + 12);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(data.residentName, 190, startY + 28);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('BILLING PERIOD', 360, startY + 12);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(data.billingPeriod, 360, startY + 28);

    // Bill Calculation Table
    const tableY = startY + 95;
    doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text('Maintenance Calculation Breakdown', 50, tableY);

    // Table Header
    doc.rect(50, tableY + 20, 495, 26).fill('#f1f5f9');
    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 65, tableY + 28);
    doc.text('Rate / Unit', 260, tableY + 28);
    doc.text('Area / Qty', 370, tableY + 28);
    doc.text('Amount (INR)', 455, tableY + 28, { align: 'right', width: 80 });

    // Rows
    let currentY = tableY + 55;
    doc.font('Helvetica').fontSize(10).fillColor('#0f172a');

    // Row 1: Fixed Common Area Charge
    doc.text('Fixed Common Maintenance Charge', 65, currentY);
    doc.text('Flat fee', 260, currentY);
    doc.text('1 Unit', 370, currentY);
    doc.text(`₹ ${Number(data.fixedCharge).toFixed(2)}`, 455, currentY, { align: 'right', width: 80 });

    // Row 2: Variable Area Charge
    currentY += 25;
    doc.text('Super Built-Up Pro-Rated Maintenance', 65, currentY);
    doc.text(`₹ ${Number(data.sqFtRate).toFixed(2)} / sq.ft`, 260, currentY);
    doc.text(`${data.areaSqFt} sq.ft`, 370, currentY);
    doc.text(`₹ ${Number(data.variableCharge).toFixed(2)}`, 455, currentY, { align: 'right', width: 80 });

    // Separator line
    currentY += 25;
    doc.moveTo(50, currentY).lineTo(545, currentY).stroke('#cbd5e1');

    // Total Amount Row
    currentY += 12;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a');
    doc.text('Total Amount Paid', 65, currentY);
    doc.fillColor('#16a34a').text(`₹ ${Number(data.totalPaid).toFixed(2)}`, 455, currentY, { align: 'right', width: 80 });

    // Payment Transaction Summary Box
    currentY += 40;
    doc.roundedRect(50, currentY, 495, 95, 6).fillAndStroke('#f0fdf4', '#bbf7d0');

    doc.fillColor('#166534').fontSize(11).font('Helvetica-Bold').text('✓ Payment Verification Status: CONFIRMED & VERIFIED', 65, currentY + 12);

    doc.font('Helvetica').fontSize(10).fillColor('#374151');
    doc.text(`Payment Mode: ${data.paymentMethod}`, 65, currentY + 34);
    doc.text(`Bank UTR / Transaction Ref: ${data.utrNumber}`, 65, currentY + 52);
    doc.text(`Transaction Date: ${new Date(data.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 65, currentY + 70);

    doc.text(`Verified On: ${new Date(data.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 310, currentY + 34);
    doc.text('Issuing Authority: RWA Treasury', 310, currentY + 52);

    // Footer
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(
      'This is an electronically generated receipt issued by the RWA Management Portal. No physical signature is required.',
      50,
      730,
      { align: 'center', width: 495 }
    );

    doc.end();

    writeStream.on('finish', () => resolve(fileName));
    writeStream.on('error', reject);
  });
}
