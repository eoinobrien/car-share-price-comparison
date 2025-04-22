/**
 * Type definitions for Car Share Price Calculator
 */

export interface CarPricing {
  hour: number;
  day: number;
  week?: number; // Optional since some cars don't have weekly rates
}

export enum KmPolicyType {
  standard = "standard",
  quarterHours = "quarterHours",
  hourly = "hourly",
  daily = "daily",
  weekly = "weekly",
}

export type FreeKmPolicy = {
  [key in KmPolicyType]?: number;
}

export interface Car {
  id: string;
  name: string;
  type: "economy" | "standard" | "premium" | "compact" | "van";
  transmission: "manual" | "automatic";
  company: string;
  pricing: CarPricing;
  freeKmPolicy?: FreeKmPolicy; // Optional car-specific overrides
  pricePerExtraKm?: number; // Optional car-specific override
  notes?: string; // Optional additional information
}

export interface Company {
  id: string;
  name: string;
  defaultPricePerExtraKm: number;
  freeKmPolicy: FreeKmPolicy;
}

export interface PriceCalculationResult {
  timeCost: number;
  distanceCost: number;
  totalPrice: number;
  freeKm: number;
  pricePerExtraKm: number;
  pricingTier: string;
}

export interface PriceResultWithDetails extends PriceCalculationResult {
  car: Car;
  company: Company;
}
