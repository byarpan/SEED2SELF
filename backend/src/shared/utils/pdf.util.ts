export interface PdfInvoiceData {
  invoiceId: string;
  orderNumber?: string;
  batchReference: string;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  paymentStatus: string;
  generatedAt: Date;
  items: Array<{
    cropName: string;
    variety?: string;
    quantityKg: number;
    pricePerKg: number;
    totalAmount: number;
  }>;
}

export function generateInvoicePdfBuffer(data: PdfInvoiceData): Buffer {
  const dateStr = new Date(data.generatedAt).toISOString().split('T')[0];
  
  // Format items text content
  const itemsText = data.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.cropName}${item.variety ? ` (${item.variety})` : ''} - ${item.quantityKg} kg @ Rs.${item.pricePerKg}/kg = Rs.${item.totalAmount}`
    )
    .join('\n');

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
4 0 obj
<< /Length 800 >>
stream
BT
/F1 18 Tf
50 750 TD
(SEED2SHELF OFFICIAL TAX INVOICE) Tj
/F1 12 Tf
0 -30 TD
(Invoice ID: ${data.invoiceId}) Tj
0 -20 TD
(Date: ${dateStr}) Tj
0 -20 TD
(Payment Status: ${data.paymentStatus}) Tj
0 -20 TD
(Batch Reference: ${data.batchReference}) Tj
0 -20 TD
(Order Number: ${data.orderNumber || 'N/A'}) Tj
0 -30 TD
(Seller: ${data.sellerName}) Tj
0 -20 TD
(Buyer: ${data.buyerName}) Tj
0 -30 TD
(ITEM DETAILS:) Tj
0 -20 TD
(${itemsText.replace(/[()]/g, '')}) Tj
0 -40 TD
(TOTAL AMOUNT PAID: Rs. ${data.totalAmount}) Tj
0 -40 TD
(Thank you for using Seed2Shelf Supply Chain Platform.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
0000000230 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1150
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}
