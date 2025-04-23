/**
 * Car Share Price Calculator Tests
 *
 * Tests for the core calculation functions of the car share price comparison app.
 */

import CarShareCalculator from "../js/carShareCalculator";
import { Car, Company } from "../js/types";

// Test data setup
const mockCars: Record<string, Car> = {
  economy: {
    id: "economy-test",
    name: "EconoTest",
    type: "economy",
    transmission: "manual",
    fuelType: "petrol-diesel",
    company: "gocar",
    pricing: {
      hour: 8,
      day: 45,
      week: 270,
    },
  },
  premiumAuto: {
    id: "premium-test",
    name: "PremiumTest",
    type: "premium",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    company: "driveyou",
    pricing: {
      hour: 12,
      day: 65,
      week: 350,
    },
    freeKmPolicy: {
      hourly: 20, // Override company policy
      daily: 120,
    },
  },
  standardNoWeeklyRate: {
    id: "standard-test",
    name: "StandardTest",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    company: "yuko",
    pricing: {
      hour: 10,
      day: 55,
      // No weekly rate
    },
  },
  // Adding a car with custom price per extra km
  compactWithExtraKmPrice: {
    id: "compact-test",
    name: "CompactTest",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    company: "gocar",
    pricing: {
      hour: 7,
      day: 40,
      week: 240,
    },
    pricePerExtraKm: 0.3, // Custom price per extra km
  },
};

const mockCompanies: Record<string, Company> = {
  gocar: {
    id: "gocar",
    name: "GoCar",
    defaultPricePerExtraKm: 0.25,
    freeKmPolicy: {
      standard: 50,
    },
  },
  driveyou: {
    id: "driveyou",
    name: "DriveYou",
    defaultPricePerExtraKm: 0.25,
    freeKmPolicy: {
      hourly: 15,
      daily: 50,
      weekly: 300,
    },
  },
  yuko: {
    id: "yuko",
    name: "Yuko",
    defaultPricePerExtraKm: 0.25,
    freeKmPolicy: {
      daily: 50,
      weekly: 300,
    },
  },
};

describe("CarShareCalculator", () => {
  describe("calculateCarPrice", () => {
    test("should calculate price for short duration (1 hour) with no extra km", () => {
      const result = CarShareCalculator.calculateCarPrice(
        mockCars.economy,
        mockCompanies.gocar,
        1, // 1 hour
        30 // 30 km (within free km limit)
      );

      expect(result.timeCost).toBe(8); // hourly rate
      expect(result.distanceCost).toBe(0); // no extra km
      expect(result.totalPrice).toBe(8);
      expect(result.pricingTier).toBe("1 hour (minimum)");
    });

    test("should calculate price with extra kilometers", () => {
      const result = CarShareCalculator.calculateCarPrice(
        mockCars.economy,
        mockCompanies.gocar,
        1, // 1 hour
        70 // 70 km (20 km over free limit)
      );

      expect(result.timeCost).toBe(8); // hourly rate
      expect(result.freeKm).toBe(50); // standard policy
      expect(result.distanceCost).toBe(5); // 20 km × 0.25
      expect(result.totalPrice).toBe(13);
    });

    test("should use car's custom price per extra km when available", () => {
      const result = CarShareCalculator.calculateCarPrice(
        mockCars.compactWithExtraKmPrice,
        mockCompanies.gocar,
        1,
        70 // 20 km over free limit
      );

      expect(result.timeCost).toBe(7); // hourly rate
      expect(result.pricePerExtraKm).toBe(0.3); // car-specific rate
      expect(result.distanceCost).toBe(6); // 20 km × 0.30
      expect(result.totalPrice).toBe(13);
    });

    test("should use car's overridden free km policy when available", () => {
      const result = CarShareCalculator.calculateCarPrice(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        1, // 1 hour
        25 // 25 km (5 km over the car's custom hourly limit)
      );

      expect(result.freeKm).toBe(20); // Car-specific hourly policy
      expect(result.distanceCost).toBe(1.25); // 5 km × 0.25
    });
  });

  describe("formatTimeComponent", () => {
    test("should format minutes for durations < 1 hour", () => {
      expect(CarShareCalculator.formatTimeComponent(0.5)).toBe("30 mins");
      expect(CarShareCalculator.formatTimeComponent(0.75)).toBe("45 mins");
    });

    test("should format whole hours", () => {
      expect(CarShareCalculator.formatTimeComponent(1)).toBe("1 hour");
      expect(CarShareCalculator.formatTimeComponent(2)).toBe("2 hours");
    });

    test("should format fractional hours", () => {
      expect(CarShareCalculator.formatTimeComponent(2.5)).toBe("2.5 hours");
      expect(CarShareCalculator.formatTimeComponent(3.25)).toBe("3.25 hours");
    });
  });

  describe("capitalizeFirstLetter", () => {
    test("should capitalize first letter", () => {
      expect(CarShareCalculator.capitalizeFirstLetter("test")).toBe("Test");
      expect(CarShareCalculator.capitalizeFirstLetter("car")).toBe("Car");
    });
  });
});
