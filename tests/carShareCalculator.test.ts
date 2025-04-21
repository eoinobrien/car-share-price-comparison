/**
 * Car Share Price Calculator Tests
 *
 * Tests for the core calculation functions of the car share price comparison app.
 */

import CarShareCalculator from "../js/carShareCalculator";
import { Car, Company, KmPolicyType } from "../js/types";

// Test data setup
const mockCars: Record<string, Car> = {
  economy: {
    id: "economy-test",
    name: "EconoTest",
    type: "economy",
    transmission: "manual",
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
    company: "gocar",
    pricing: {
      hour: 7,
      day: 40,
      week: 240,
    },
    pricePerExtraKm: 0.30, // Custom price per extra km
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
      expect(result.policyType).toBe("standard");
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
      expect(result.policyType).toBe("hourly");
    });
  });

  describe("calculateTimeCost", () => {
    test("should return hourly rate for duration <= 1 hour", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 1);
      
      expect(result.cost).toBe(8);
      expect(result.tier).toBe("1 hour (minimum)");
    });

    test("should calculate hourly pricing for 1-24 hour durations", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 4);
      
      expect(result.cost).toBe(32); // 4 × 8
      expect(result.tier).toBe("4 hours");
    });

    test("should use daily rate when cheaper than hourly rate", () => {
      // At 6 hours the hourly rate (6 × 8 = 48) exceeds daily rate (45)
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 6);
      
      expect(result.cost).toBe(45); // Daily rate
      expect(result.tier).toBe("1 day");
    });

    test("should calculate daily rate for 1-7 day durations", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 36); // 1.5 days
      
      expect(result.cost).toBe(90); // 2 days is cheaper than, 1 day + 12 hours.
      expect(result.tier).toBe("2 days");
    });

    test("should use 2 full days when cheaper than daily rate + hours", () => {
      // At 21 additional hours, daily rate (45) is cheaper than hourly (21×8 = 168)
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 45); // 1 day + 21 hours
      
      expect(result.cost).toBe(90); // 2 × daily rate
      expect(result.tier).toBe("2 days");
    });

    test("should calculate weekly rate for durations > 7 days", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 192); // 8 days (1 week + 1 day)
      
      expect(result.cost).toBe(270 + 45); // 1 week + 1 day rate
      expect(result.tier).toBe("1 week + 1 day");
    });

    test("should fall back to daily rate when no weekly rate exists", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.standardNoWeeklyRate, 192); // 8 days
      
      expect(result.cost).toBe(55 * 8); // 8 × daily rate
      expect(result.tier).toBe("8 days (no weekly rate)");
    });
  });

  describe("determineFreeKmPolicy", () => {
    test("should use hourly policy for short rentals", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        4 // 4 hours
      );
      
      expect(result.policyType).toBe(KmPolicyType.hourly);
      expect(result.freeKm).toBe(80); // 4 hours × 20km per hour
    });

    test("should use daily policy for medium-length rentals", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        36 // 1.5 days
      );
      
      expect(result.policyType).toBe(KmPolicyType.daily);
      expect(result.freeKm).toBe(180); // 1.5 days × 120km per day
    });

    test("should use weekly policy for longer rentals", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.economy, // This car doesn't override weekly policy
        mockCompanies.driveyou,
        192 // 8 days (> 1 week)
      );
      
      expect(result.policyType).toBe(KmPolicyType.weekly);
      // 8/7 weeks × 300km per week = 342.86, rounded to 343
      expect(result.freeKm).toBe(343);
    });

    test("should use standard policy when no duration-based policy exists", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.economy,
        mockCompanies.gocar, // Only has standard policy
        36 // 1.5 days
      );
      
      expect(result.policyType).toBe(KmPolicyType.standard);
      expect(result.freeKm).toBe(50);
    });
  });

  describe("calculateFreeKm", () => {
    test("should return 0 when policy doesn't exist", () => {
      // Custom company without any policies
      const noKmPolicyCompany = {
        id: "test",
        name: "Test",
        defaultPricePerExtraKm: 0.3,
        freeKmPolicy: {}
      };
      
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.economy,
        noKmPolicyCompany,
        1,
        KmPolicyType.standard
      );
      
      expect(result).toBe(0);
    });

    test("should use car's override when available", () => {
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        1,
        KmPolicyType.hourly
      );
      
      expect(result).toBe(20); // Car override
    });

    test("should not multiply standard policy by duration", () => {
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.economy,
        mockCompanies.gocar,
        5, // Duration shouldn't matter for standard policy
        KmPolicyType.standard
      );
      
      expect(result).toBe(50); // Not multiplied
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

  describe("calculateHourlyRate", () => {
    test("should calculate proper hourly rate", () => {
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 3.5);
      
      expect(result.cost).toBe(28); // 3.5 × 8
      expect(result.tier).toBe("3.5 hours");
    });
    
    test("should switch to daily rate when cheaper", () => {
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 6);
      
      expect(result.cost).toBe(45); // Daily rate
      expect(result.tier).toBe("1 day");
    });
    
    test("should handle 15-minute increments", () => {
      // 1 hour 15 minutes (1.25) should cost 1 hour + 1 quarter hour
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 1.25);
      
      expect(result.cost).toBe(10); // 8 (hourly) + 2 (quarter hourly)
      expect(result.tier).toBe("1.25 hours");
    });
    
    test("should handle multiple 15-minute increments", () => {
      // 2 hours 45 minutes (2.75) should cost 2 hours + 3 quarter hours
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 2.75);
      
      expect(result.cost).toBe(22); // 16 (2 hours) + 6 (3 quarter hours)
      expect(result.tier).toBe("2.75 hours");
    });
    
    test("should round up to nearest 15-minute increment", () => {
      // 1 hour 10 minutes should round up to 1 hour 15 minutes
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 1.17);
      
      expect(result.cost).toBe(10); // 8 (hourly) + 2 (quarter hourly)
      expect(result.tier).toBe("1.25 hours");
    });
  });

  describe("capitalizeFirstLetter", () => {
    test("should capitalize first letter", () => {
      expect(CarShareCalculator.capitalizeFirstLetter("test")).toBe("Test");
      expect(CarShareCalculator.capitalizeFirstLetter("car")).toBe("Car");
    });
  });
});
