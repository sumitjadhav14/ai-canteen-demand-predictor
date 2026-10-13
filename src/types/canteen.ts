/**
 * Canteen Demand Predictor Type Definitions
 */

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Hot' | 'Cold';

export type FoodItemName = string;

export interface SalesRecord {
  id: string;
  Date: string;
  Day: DayOfWeek;
  Weather: WeatherCondition;
  Previous_Day_Sales: number;
  Is_Holiday: 'Yes' | 'No';
  Is_Special_Event: 'Yes' | 'No';
  Student_Attendance: number;
  Food_Item: FoodItemName;
  Units_Sold: number;
}

export interface PredictionInput {
  foodItem: FoodItemName;
  day: DayOfWeek;
  weather: WeatherCondition;
  studentAttendance: number;
  previousDaySales: number;
  isHoliday: 'Yes' | 'No';
  isSpecialEvent: 'Yes' | 'No';
}

export type DemandLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface PredictionResult {
  predictedUnits: number;
  demandLevel: DemandLevel;
  recommendedPrepMin: number;
  recommendedPrepMax: number;
  recommendationText: string;
  confidence: number;
  wasteAvoidancePercent: number;
  input: PredictionInput;
}

export interface ModelMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2Score: number;
  algorithm: string;
  nEstimators: number;
  trainingSamples: number;
  testSamples: number;
}

export interface UserPredictionRecord {
  id: string;
  userId: string;
  timestamp: string;
  foodItem: FoodItemName;
  day: DayOfWeek;
  weather: WeatherCondition;
  previousDaySales: number;
  studentAttendance: number;
  isHoliday: 'Yes' | 'No';
  isSpecialEvent: 'Yes' | 'No';
  predictedUnits: number;
  demandLevel: DemandLevel;
  recommendation: string;
}

export type ActivePage =
  | 'dashboard'
  | 'predict'
  | 'sales_data'
  | 'analytics'
  | 'ai_model'
  | 'about'
  | 'auth';
