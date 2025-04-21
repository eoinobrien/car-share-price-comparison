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
      fifteenMin: 2.5,
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
      fifteenMin: 4.0,
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
      fifteenMin: 3.0,
      hour: 10,
      day: 55,
      // No weekly rate
    },
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
    defaultPricePerExtraKm: 0.3,
    freeKmPolicy: {
      hourly: 15,
      daily: 100,
      weekly: 700,
    },
  },
  yuko: {
    id: "yuko",
    name: "Yuko",
    defaultPricePerExtraKm: 0.2,
    freeKmPolicy: {
      standard: 40,
      daily: 80,
      weekly: 500,
    },
  },
};

describe("CarShareCalculator", () => {
  describe("calculateCarPrice", () => {
    test("calculates price for short trip (minimum 1 hour) with GoCar", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        0.5,
        20
      );

      expect(result.timeCost).toBe(8); // GoCar has minimum 1 hour booking
      expect(result.distanceCost).toBe(0); // Under free km limit
      expect(result.totalPrice).toBe(8);
      expect(result.pricingTier).toBe("1 hour (minimum)");
    });

    test("applies minimum 1 hour rate for short trips with DriveYou", () => {
      const car = mockCars.premiumAuto;
      const company = mockCompanies.driveyou;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        0.25,
        5
      );

      expect(result.timeCost).toBe(12); // 1 hour minimum rate
      expect(result.distanceCost).toBe(0); // Under free km limit
      expect(result.totalPrice).toBe(12);
      expect(result.pricingTier).toBe("1 hour (minimum)");
    });

    test("calculates price for 45-minute trip with DriveYou (multiple 15-min periods)", () => {
      const car = mockCars.premiumAuto;
      const company = mockCompanies.driveyou;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        0.75,
        10
      );

      // Should be 3 x 15-min periods
      expect(result.timeCost).toBe(12); // Hourly rate is better than 3 x 15-min rate
      expect(result.distanceCost).toBe(0);
      expect(result.totalPrice).toBe(12);
    });

    test("calculates price for 3-hour trip", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(car, company, 3, 30);

      expect(result.timeCost).toBe(24); // 3 x hourly rate
      expect(result.distanceCost).toBe(0); // Under free km limit
      expect(result.totalPrice).toBe(24);
      expect(result.pricingTier).toBe("3 hours");
    });

    test("daily rate is used when cheaper than hourly rate", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(car, company, 6, 40);

      expect(result.timeCost).toBe(45); // Daily rate (cheaper than 6 x 8 = 48)
      expect(result.distanceCost).toBe(0); // Under free km limit
      expect(result.totalPrice).toBe(45);
      expect(result.pricingTier).toBe("1 day");
    });

    test("calculates distance cost when exceeding free kilometers", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(car, company, 2, 60);

      expect(result.timeCost).toBe(16); // 2 x hourly rate
      expect(result.freeKm).toBe(50); // Standard GoCar policy
      expect(result.distanceCost).toBe(2.5); // (60 - 50) * 0.25
      expect(result.totalPrice).toBe(18.5);
    });

    test("uses company defaultPricePerExtraKm rate correctly", () => {
      const car = mockCars.standardNoWeeklyRate;
      const company = mockCompanies.yuko;

      const result = CarShareCalculator.calculateCarPrice(car, company, 1, 50);

      expect(result.pricePerExtraKm).toBe(0.2);
      expect(result.freeKm).toBe(40);
      expect(result.distanceCost).toBe(2); // (50 - 40) * 0.20
    });

    test("handles duration-based free km for DriveYou (hourly policy)", () => {
      const car = mockCars.premiumAuto;
      const company = mockCompanies.driveyou;

      const result = CarShareCalculator.calculateCarPrice(car, company, 4, 90);

      expect(result.freeKm).toBe(80); // Car overrides company policy: 4 hours * 20km
      expect(result.distanceCost).toBe(3); // (90 - 80) * 0.30
      expect(result.policyType).toBe("hourly");
    });

    test("handles duration-based free km for DriveYou (daily policy)", () => {
      const car = mockCars.premiumAuto;
      const company = mockCompanies.driveyou;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        30,
        200
      );

      expect(result.freeKm).toBe(120); // Car overrides (30/24 = 1.25 days * 120km/day)
      expect(result.distanceCost).toBe((200 - 120) * 0.3); // Additional km * rate
      expect(result.policyType).toBe("daily");
    });

    test("calculates multi-day rate correctly", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        50,
        150
      );

      expect(result.timeCost).toBe(90); // 2 days at 45 each
      expect(result.distanceCost).toBe(25); // (150 - 50) * 0.25
      expect(result.totalPrice).toBe(115);
      expect(result.pricingTier).toBe("2 days");
    });

    test("calculates weekly rate when available", () => {
      const car = mockCars.economy;
      const company = mockCompanies.gocar;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        200,
        300
      );

      expect(result.timeCost).toBe(270 + 45); // 1 week (270) + 1 day (45)
      expect(result.distanceCost).toBe((300 - 50) * 0.25); // Additional km * rate
    });

    test("falls back to daily rate when weekly rate not available", () => {
      const car = mockCars.standardNoWeeklyRate;
      const company = mockCompanies.yuko;

      const result = CarShareCalculator.calculateCarPrice(
        car,
        company,
        192,
        200
      );

      // 192 hours = 8 days
      expect(result.timeCost).toBe(8 * 55); // 8 days at daily rate
      expect(result.pricingTier).toContain("no weekly rate");
    });
  });

  describe("calculateFreeKm", () => {
    test("calculates standard free kilometers correctly", () => {
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.economy,
        mockCompanies.gocar,
        1,
        KmPolicyType.standard
      );
      expect(result).toBe(50);
    });

    test("calculates hourly free kilometers correctly", () => {
      // Using car override
      const result1 = CarShareCalculator.calculateFreeKm(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        4,
        KmPolicyType.hourly
      );
      expect(result1).toBe(80); // 4 hours * 20km (car override)

      // Using company default
      const carWithoutOverride: Car = { ...mockCars.premiumAuto };
      delete carWithoutOverride.freeKmPolicy;

      const result2 = CarShareCalculator.calculateFreeKm(
        carWithoutOverride,
        mockCompanies.driveyou,
        4,
        KmPolicyType.hourly
      );
      expect(result2).toBe(60); // 4 hours * 15km (company default)
    });

    test("calculates daily free kilometers correctly", () => {
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.standardNoWeeklyRate,
        mockCompanies.yuko,
        3,
        KmPolicyType.daily
      );
      expect(result).toBe(240); // 3 days * 80km
    });

    test("calculates weekly free kilometers correctly", () => {
      const result = CarShareCalculator.calculateFreeKm(
        mockCars.standardNoWeeklyRate,
        mockCompanies.yuko,
        2,
        KmPolicyType.weekly
      );
      expect(result).toBe(1000); // 2 weeks * 500km
    });
  });

  describe("capitalizeFirstLetter", () => {
    test("capitalizes first letter of a string", () => {
      expect(CarShareCalculator.capitalizeFirstLetter("economy")).toBe(
        "Economy"
      );
      expect(CarShareCalculator.capitalizeFirstLetter("PREMIUM")).toBe(
        "PREMIUM"
      );
      expect(CarShareCalculator.capitalizeFirstLetter("a")).toBe("A");
    });

    test("handles empty string", () => {
      expect(CarShareCalculator.capitalizeFirstLetter("")).toBe("");
    });
  });

  describe("calculateTimeCost", () => {
    test("returns minimum 1 hour rate for durations <= 1 hour", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 0.5);
      expect(result.cost).toBe(8);
      expect(result.tier).toBe("1 hour (minimum)");
    });

    test("uses hourly calculation for durations between 1-24 hours", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 4);
      expect(result.cost).toBe(32); // 4 * 8
      expect(result.tier).toBe("4 hours");
    });

    test("uses daily calculation for durations between 1-7 days", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 30);
      // Should delegate to calculateDailyRate
      expect(result.cost).toBe(45); // Daily rate is 45
      expect(result.tier).toBe("1 day + 6 hours");
    });

    test("uses weekly calculation for durations > 7 days", () => {
      const result = CarShareCalculator.calculateTimeCost(mockCars.economy, 200);
      // Should delegate to calculateWeeklyRate
      expect(result.cost).toBe(315); // 1 week (270) + 1 day (45)
      expect(result.tier).toBe("1 week + 1 day");
    });
  });

  describe("calculateHourlyRate", () => {
    test("returns correct hourly rate for whole hours", () => {
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 3);
      expect(result.cost).toBe(24); // 3 * 8
      expect(result.tier).toBe("3 hours");
    });

    test("returns correct hourly rate for fractional hours", () => {
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 2.5);
      expect(result.cost).toBe(20); // 2.5 * 8
      expect(result.tier).toBe("2.5 hours");
    });

    test("switches to daily rate when it's cheaper than hourly", () => {
      const result = CarShareCalculator.calculateHourlyRate(mockCars.economy, 6);
      expect(result.cost).toBe(45); // Daily rate (45) is cheaper than 6*8=48
      expect(result.tier).toBe("1 day");
    });
  });

  describe("calculateDailyRate", () => {
    test("calculates rates for full days", () => {
      const result = CarShareCalculator.calculateDailyRate(mockCars.economy, 48);
      expect(result.cost).toBe(90); // 2 * 45
      expect(result.tier).toBe("2 days");
    });

    test("calculates rates for days plus hours", () => {
      const result = CarShareCalculator.calculateDailyRate(mockCars.economy, 30);
      expect(result.cost).toBe(45 + 6*8); // 1 day (45) + 6 hours (48)
      expect(result.tier).toBe("1 day + 6 hours");
    });

    test("uses full day when it's cheaper than day + hours", () => {
      // For a car where day rate is 45 and hourly is 8
      // 1 day + 5 hours = 45 + (5*8) = 45 + 40 = 85
      // Which is more expensive than 2 days at 90
      const result = CarShareCalculator.calculateDailyRate(mockCars.economy, 29);
      expect(result.cost).toBe(90); // 2 days is cheaper
      expect(result.tier).toBe("2 days");
    });
  });

  describe("calculateWeeklyRate", () => {
    test("calculates weekly rate when available", () => {
      const result = CarShareCalculator.calculateWeeklyRate(mockCars.economy, 200);
      expect(result.cost).toBe(270 + 45); // 1 week (270) + 1 day (45)
      expect(result.tier).toBe("1 week + 1 day + 8 hours");
    });

    test("handles exactly 1 week correctly (168 hours)", () => {
      const result = CarShareCalculator.calculateWeeklyRate(mockCars.economy, 168);
      expect(result.cost).toBe(270); // Exactly 1 week
      expect(result.tier).toBe("1 week");
    });

    test("handles 1 week plus 1 hour correctly (169 hours)", () => {
      const result = CarShareCalculator.calculateWeeklyRate(mockCars.economy, 169);
      expect(result.cost).toBe(270 + 8); // 1 week (270) + 1 hour (8)
      expect(result.tier).toBe("1 week + 1 hour");
    });

    test("uses another full week when it's cheaper than week + days", () => {
      // Set up a scenario where weekly rate (270) is cheaper than
      // remaining days cost for a 2 week minus 1 day duration
      const result = CarShareCalculator.calculateWeeklyRate(mockCars.economy, 312); // 312 = 168*2 - 24
      expect(result.cost).toBe(270 * 2); // 2 weeks is cheaper than 1 week + 6 days
      expect(result.tier).toBe("2 weeks");
    });

    test("falls back to daily rate when weekly rate not available", () => {
      const result = CarShareCalculator.calculateWeeklyRate(mockCars.standardNoWeeklyRate, 200);
      // 200 hours / 24 = ~8.33 days, rounded up to 9 days
      expect(result.cost).toBe(9 * 55); 
      expect(result.tier).toBe("9 days (no weekly rate)");
    });
  });

  describe("formatTimeComponent", () => {
    test("formats whole hours correctly", () => {
      expect(CarShareCalculator.formatTimeComponent(3)).toBe("3 hours");
      expect(CarShareCalculator.formatTimeComponent(1)).toBe("1 hour");
    });

    test("formats fractional hours correctly", () => {
      expect(CarShareCalculator.formatTimeComponent(2.5)).toBe("2.5 hours");
      expect(CarShareCalculator.formatTimeComponent(1.75)).toBe("1.75 hours");
    });

    test("formats minutes correctly", () => {
      expect(CarShareCalculator.formatTimeComponent(0.5)).toBe("30 mins");
      expect(CarShareCalculator.formatTimeComponent(0.25)).toBe("15 mins");
      expect(CarShareCalculator.formatTimeComponent(0.08333)).toBe("5 mins");
    });

    test("handles single minute case", () => {
      expect(CarShareCalculator.formatTimeComponent(0.01667)).toBe("1 min");
    });
  });

  describe("determineFreeKmPolicy", () => {
    test("determines hourly policy for DriveYou with short duration", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        3
      );
      expect(result.policyType).toBe("hourly");
      expect(result.freeKm).toBe(60); // 3 hours * 20km (car override)
    });

    test("determines daily policy for DriveYou with medium duration", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        30
      );
      expect(result.policyType).toBe("daily");
      expect(result.freeKm).toBe(150); // 30/24 = 1.25 days * 120km/day
    });

    test("determines weekly policy for DriveYou with long duration", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.premiumAuto,
        mockCompanies.driveyou,
        200
      );
      expect(result.policyType).toBe("weekly");
      expect(result.freeKm).toBe(834); // 200/168 = 1.19 weeks * 700km/week
    });

    test("determines standard policy for GoCar regardless of duration", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.economy,
        mockCompanies.gocar,
        100
      );
      expect(result.policyType).toBe("standard");
      expect(result.freeKm).toBe(50); // Standard policy
    });

    test("uses daily policy for Yuko with medium duration", () => {
      const result = CarShareCalculator.determineFreeKmPolicy(
        mockCars.standardNoWeeklyRate,
        mockCompanies.yuko,
        36
      );
      expect(result.policyType).toBe("daily");
      expect(result.freeKm).toBe(120); // 36/24 = 1.5 days * 80km/day
    });
  });
});
