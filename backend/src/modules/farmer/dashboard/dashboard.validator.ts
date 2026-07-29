import { UpdateFarmDetailsDTO } from './dto/dashboard.dto.js';

export class DashboardValidator {
  static validateUpdateFarm(dto: UpdateFarmDetailsDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.farmName !== undefined && (!dto.farmName.trim() || dto.farmName.length < 2)) {
      errors.push('Farm name must be at least 2 characters long');
    }

    if (dto.farmLocation !== undefined && !dto.farmLocation.trim()) {
      errors.push('Farm location cannot be empty');
    }

    if (dto.latitude !== undefined && (typeof dto.latitude !== 'number' || dto.latitude < -90 || dto.latitude > 90)) {
      errors.push('Latitude must be a valid number between -90 and 90');
    }

    if (dto.longitude !== undefined && (typeof dto.longitude !== 'number' || dto.longitude < -180 || dto.longitude > 180)) {
      errors.push('Longitude must be a valid number between -180 and 180');
    }

    if (dto.totalLandArea !== undefined && (typeof dto.totalLandArea !== 'number' || dto.totalLandArea <= 0)) {
      errors.push('Total land area must be a positive number');
    }

    if (dto.landAreaUnit !== undefined && !dto.landAreaUnit.trim()) {
      errors.push('Land area unit cannot be empty');
    }

    if (dto.farmingPractice !== undefined && !dto.farmingPractice.trim()) {
      errors.push('Farming practice cannot be empty');
    }

    if (dto.mainCultivatedCrops !== undefined && (!Array.isArray(dto.mainCultivatedCrops) || dto.mainCultivatedCrops.some(crop => typeof crop !== 'string'))) {
      errors.push('Main cultivated crops must be an array of strings');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
