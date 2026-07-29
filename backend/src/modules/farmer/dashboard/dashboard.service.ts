import { DashboardRepository, dashboardRepository } from './dashboard.repository.js';
import { UpdateFarmDetailsDTO } from './dto/dashboard.dto.js';
import { FarmerDashboardResponse } from './interfaces/dashboard.interface.js';
import { IFarm } from '../../../shared/models/Farm.js';

export class DashboardService {
  constructor(private repository: DashboardRepository = dashboardRepository) {}

  async getDashboard(userId: string): Promise<FarmerDashboardResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('Farmer user profile not found');
    }

    const farm = await this.repository.findFarmByUserId(userId);

    let googleMapsUrl: string | null = null;
    if (farm) {
      if (typeof farm.latitude === 'number' && typeof farm.longitude === 'number') {
        googleMapsUrl = `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`;
      } else if (farm.farmLocation) {
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.farmLocation)}`;
      }
    }

    return {
      farmerId: user.farmerId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      farm: farm
        ? {
            id: farm._id.toString(),
            farmName: farm.farmName,
            farmLocation: farm.farmLocation,
            latitude: farm.latitude,
            longitude: farm.longitude,
            googleMapsUrl,
            totalLandArea: farm.totalLandArea,
            landAreaUnit: farm.landAreaUnit,
            farmingPractice: farm.farmingPractice,
            mainCultivatedCrops: farm.mainCultivatedCrops,
            createdAt: farm.createdAt,
            updatedAt: farm.updatedAt,
          }
        : null,
    };
  }

  async updateFarmDetails(userId: string, dto: UpdateFarmDetailsDTO): Promise<IFarm> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedFarm = await this.repository.upsertFarm(userId, dto);
    return updatedFarm;
  }
}

export const dashboardService = new DashboardService();
