import Counter from '../models/Counter.js';

export async function generateSequenceId(rolePrefix: 'FRM' | 'PRC' | 'DST' | 'RTL' | 'CST' | 'ADM'): Promise<string> {
  const counterId = `${rolePrefix.toLowerCase()}_id_seq`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  const sequenceNumber = String(counter.seq).padStart(6, '0');
  return `S2S-${rolePrefix}-${sequenceNumber}`;
}

export async function generateInvoiceId(invoiceType: 'SALES' | 'PURCHASE' = 'SALES'): Promise<string> {
  const typeCode = invoiceType === 'PURCHASE' ? 'PUR' : 'SLS';
  const year = new Date().getFullYear();
  const counterId = `invoice_${typeCode.toLowerCase()}_${year}_seq`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  const sequenceNumber = String(counter?.seq || 1).padStart(6, '0');
  return `INV-${typeCode}-${year}-${sequenceNumber}`;
}

export async function generateBatchId(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `batch_${year}_seq`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  const sequenceNumber = String(counter?.seq || 1).padStart(6, '0');
  return `S2S-BAT-${year}-${sequenceNumber}`;
}

export async function generateTicketId(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `ticket_${year}_seq`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  const sequenceNumber = String(counter?.seq || 1).padStart(6, '0');
  return `S2S-TKT-${year}-${sequenceNumber}`;
}

export async function generateNotificationId(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `notification_${year}_seq`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  const sequenceNumber = String(counter?.seq || 1).padStart(6, '0');
  return `S2S-NTF-${year}-${sequenceNumber}`;
}
