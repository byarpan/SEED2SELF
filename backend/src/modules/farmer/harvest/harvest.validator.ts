import { RegisterHarvestDTO, UpdateHarvestDTO } from './dto/harvest.dto.js';

export class HarvestValidator {
  static validateRegisterHarvest(dto: RegisterHarvestDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.cropCategory || !dto.cropCategory.trim()) {
      errors.push('Crop category is required');
    }

    if (!dto.cropName || !dto.cropName.trim()) {
      errors.push('Crop name is required');
    }

    if (typeof dto.harvestVolume !== 'number' || dto.harvestVolume <= 0) {
      errors.push('Harvest volume must be a positive number');
    }

    if (typeof dto.sellingPrice !== 'number' || dto.sellingPrice <= 0) {
      errors.push('Selling price must be a positive number');
    }

    if (!dto.harvestDate) {
      errors.push('Harvest date is required');
    } else {
      const parsedDate = new Date(dto.harvestDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid harvest date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateHarvest(dto: UpdateHarvestDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.cropCategory !== undefined && (!dto.cropCategory || !dto.cropCategory.trim())) {
      errors.push('Crop category cannot be empty');
    }

    if (dto.cropName !== undefined && (!dto.cropName || !dto.cropName.trim())) {
      errors.push('Crop name cannot be empty');
    }

    if (dto.harvestVolume !== undefined && (typeof dto.harvestVolume !== 'number' || dto.harvestVolume <= 0)) {
      errors.push('Harvest volume must be a positive number');
    }

    if (dto.sellingPrice !== undefined && (typeof dto.sellingPrice !== 'number' || dto.sellingPrice <= 0)) {
      errors.push('Selling price must be a positive number');
    }

    if (dto.harvestDate !== undefined) {
      const parsedDate = new Date(dto.harvestDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid harvest date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
