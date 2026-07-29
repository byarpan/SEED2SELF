export class TraceabilityValidator {
  static validateBatchId(batchId: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!batchId || typeof batchId !== 'string' || batchId.trim() === '') {
      errors.push('Batch ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
