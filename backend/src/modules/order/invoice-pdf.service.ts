import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

export interface InvoiceOrderData {
  id: string;
  amountPaid: any;
  currency?: string;
  status: string;
  paymentProvider?: string | null;
  paymentId?: string | null;
  downloadToken: string;
  downloadLimit: number;
  downloadCount: number;
  expiresAt: Date | string;
  createdAt: Date | string;
  product: {
    title: string;
    price: any;
    deliveryType?: string;
  };
  customer: {
    email: string;
    name?: string | null;
  };
  brand?: {
    name?: string;
    logoUrl?: string | null;
  };
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  /**
   * Generates a high-resolution, vector PDF invoice buffer for the given order.
   */
  async generateInvoiceBuffer(order: InvoiceOrderData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 45,
          info: {
            Title: `Invoice - INV-${order.id.slice(0, 8).toUpperCase()}`,
            Author: order.brand?.name || 'Commerza Commerce',
            Subject: `Tax Invoice for Order ${order.id}`,
            Keywords: 'invoice, receipt, commerza, digital purchase',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: any) => reject(err));

        const brandName = order.brand?.name || 'Commerza';
        const invoiceNum = `INV-${order.id.slice(0, 8).toUpperCase()}`;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const currencyCode = (order.currency || 'USD').toUpperCase();
        const formattedAmount = `${currencyCode} ${parseFloat(order.amountPaid.toString()).toFixed(2)}`;

        // ================= HEADER SECTION =================
        // Top Brand & Title
        doc
          .fillColor('#0f172a')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text(brandName, 45, 45);

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('DIGITAL PRODUCT COMMERCE PLATFORM', 45, 72)
          .text('OFFICIAL PURCHASE RECEIPT & TAX INVOICE', 45, 84);

        // Top Right Invoice Metadata Card
        doc
          .fillColor('#0f172a')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(invoiceNum, 360, 45, { align: 'right' });

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text(`Date of Issue: ${orderDate}`, 360, 65, { align: 'right' })
          .text(`Order ID: ${order.id}`, 360, 77, { align: 'right' });

        // Status Badge
        const statusColor = order.status === 'PAID' ? '#16a34a' : '#ea580c';
        doc
          .rect(480, 93, 70, 18)
          .fillAndStroke(order.status === 'PAID' ? '#dcfce7' : '#ffedd5', statusColor);

        doc
          .fillColor(statusColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(order.status, 480, 97, { width: 70, align: 'center' });

        // Horizontal Accent Bar
        doc
          .moveTo(45, 125)
          .lineTo(550, 125)
          .lineWidth(1)
          .strokeColor('#e2e8f0')
          .stroke();

        // ================= BILLED TO & PAYMENT INFO =================
        const sectionTop = 145;

        // Column 1: Billed To
        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('BILLED TO', 45, sectionTop);

        doc
          .fillColor('#0f172a')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(order.customer.name || 'Valued Customer', 45, sectionTop + 14);

        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text(order.customer.email, 45, sectionTop + 28)
          .text('Digital Goods Delivery', 45, sectionTop + 40);

        // Column 2: Payment Details
        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('PAYMENT SUMMARY', 320, sectionTop);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica')
          .text('Payment Gateway:', 320, sectionTop + 14)
          .font('Helvetica-Bold')
          .text(order.paymentProvider || 'Mock Direct Payment', 430, sectionTop + 14);

        doc
          .font('Helvetica')
          .text('Transaction Ref:', 320, sectionTop + 28)
          .font('Helvetica-Bold')
          .text(order.paymentId ? order.paymentId.slice(0, 18) : 'Direct Confirmation', 430, sectionTop + 28);

        doc
          .font('Helvetica')
          .text('Payment Status:', 320, sectionTop + 42)
          .font('Helvetica-Bold')
          .fillColor(statusColor)
          .text(order.status === 'PAID' ? 'Fully Settled' : order.status, 430, sectionTop + 42);

        // ================= LINE ITEMS TABLE =================
        const tableTop = 225;

        // Table Header Background
        doc
          .rect(45, tableTop, 505, 24)
          .fill('#f8fafc');

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('ITEM & DESCRIPTION', 55, tableTop + 7)
          .text('QTY', 340, tableTop + 7, { align: 'center', width: 40 })
          .text('PRICE', 400, tableTop + 7, { align: 'right', width: 60 })
          .text('TOTAL', 480, tableTop + 7, { align: 'right', width: 60 });

        // Item Row
        const itemY = tableTop + 34;
        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(order.product.title, 55, itemY)
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Instant Downloadable Digital Asset • Single License', 55, itemY + 14);

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica')
          .text('1', 340, itemY, { align: 'center', width: 40 })
          .text(formattedAmount, 400, itemY, { align: 'right', width: 60 })
          .font('Helvetica-Bold')
          .text(formattedAmount, 480, itemY, { align: 'right', width: 60 });

        // Line under item
        doc
          .moveTo(45, itemY + 36)
          .lineTo(550, itemY + 36)
          .lineWidth(0.5)
          .strokeColor('#e2e8f0')
          .stroke();

        // ================= TOTALS BREAKDOWN =================
        const totalsY = itemY + 50;

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Subtotal:', 360, totalsY, { align: 'right', width: 100 })
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(formattedAmount, 470, totalsY, { align: 'right', width: 70 });

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Tax / GST (0%):', 360, totalsY + 16, { align: 'right', width: 100 })
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(`${currencyCode} 0.00`, 470, totalsY + 16, { align: 'right', width: 70 });

        // Total Paid Box
        doc
          .rect(340, totalsY + 36, 210, 30)
          .fill('#f1f5f9');

        doc
          .fillColor('#0f172a')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Total Amount Paid:', 350, totalsY + 45)
          .fillColor('#2563eb')
          .text(formattedAmount, 460, totalsY + 45, { align: 'right', width: 80 });

        // ================= SECURE DELIVERY NOTICE BOX =================
        const deliveryBoxY = totalsY + 85;

        doc
          .roundedRect(45, deliveryBoxY, 505, 75, 6)
          .fillAndStroke('#f8fafc', '#cbd5e1');

        doc
          .fillColor('#1e293b')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('SECURE DIGITAL DELIVERY ACCESS DETAILS', 60, deliveryBoxY + 12);

        const expFormatted = order.expiresAt
          ? new Date(order.expiresAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '30 Days Access';

        doc
          .fillColor('#475569')
          .fontSize(8.5)
          .font('Helvetica')
          .text(`• Delivery Channel: Encrypted Direct Binary Stream`, 60, deliveryBoxY + 28)
          .text(`• Download Quota: Maximum ${order.downloadLimit || 5} downloads permitted`, 60, deliveryBoxY + 42)
          .text(`• Access Expiry Date: ${expFormatted}`, 60, deliveryBoxY + 56);

        // ================= FOOTER =================
        doc
          .moveTo(45, 740)
          .lineTo(550, 740)
          .lineWidth(0.5)
          .strokeColor('#e2e8f0')
          .stroke();

        doc
          .fillColor('#94a3b8')
          .fontSize(8)
          .font('Helvetica')
          .text(
            'This is a computer-generated tax invoice and requires no physical signature. Single-instance e-commerce by Commerza.',
            45,
            750,
            { align: 'center', width: 505 }
          )
          .text(
            'Need help with this order? Contact store support with your order reference ID.',
            45,
            762,
            { align: 'center', width: 505 }
          );

        doc.end();
      } catch (err) {
        this.logger.error(`Error in generateInvoiceBuffer: ${err}`);
        reject(err);
      }
    });
  }
}
