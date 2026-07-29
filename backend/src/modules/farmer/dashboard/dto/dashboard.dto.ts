export interface UpdateFarmDetailsDTO {
  farmName?: string;
  farmLocation?: string;
  latitude?: number;
  longitude?: number;
  totalLandArea?: number;
  landAreaUnit?: string;
  farmingPractice?: string;
  mainCultivatedCrops?: string[];
}
