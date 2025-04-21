/**
 * Car Share Price Calculator Module
 *
 * Encapsulates price calculation logic for car sharing services
 * to improve testability and separation of concerns.
 */

import { Car, Company, KmPolicyType, PriceCalculationResult } from "./types";

const HOURS_PER_DAY = 24;
const HOURS_PER_WEEK = 168;

const CarShareCalculator = {
  /**
   * Calculate price for a specific car
   */
  calculateCarPrice: function (
    car: Car,
    company: Company,
    duration: number,
    kilometers: number
  ): PriceCalculationResult {
    // Calculate time-based costs
    const timeCalculation = this.calculateTimeCost(car, duration);
    const timeCost = timeCalculation.cost;
    const pricingTier = timeCalculation.tier;

    // Determine free kilometers policy
    const kmPolicyResult = this.determineFreeKmPolicy(car, company, duration);
    const freeKm = kmPolicyResult.freeKm;
    const policyType = kmPolicyResult.policyType;

    // Determine price per extra km
    const pricePerExtraKm =
      car.pricePerExtraKm !== undefined
        ? car.pricePerExtraKm
        : company.defaultPricePerExtraKm;

    // Calculate distance-based cost
    const distanceCost =
      kilometers > freeKm ? (kilometers - freeKm) * pricePerExtraKm : 0;

    // Calculate total price
    const totalPrice = timeCost + distanceCost;

    return {
      timeCost,
      distanceCost,
      totalPrice,
      freeKm,
      pricePerExtraKm,
      policyType,
      pricingTier,
    };
  },

  /**
   * Calculate time-based cost based on duration
   */
  calculateTimeCost: function (
    car: Car,
    duration: number
  ): { cost: number; tier: string } {
    // Short trip (1 hour or less)
    if (duration <= 1) {
      return {
        cost: car.pricing.hour,
        tier: "1 hour (minimum)",
      };
    }
    // Medium trip (1-24 hours)
    else if (duration < HOURS_PER_DAY) {
      return this.calculateHourlyRate(car, duration);
    }
    // Longer trip (1-7 days)
    else if (duration < HOURS_PER_WEEK) {
      return this.calculateDailyRate(car, duration);
    }
    // Extended trip (>7 days)
    else {
      return this.calculateWeeklyRate(car, duration);
    }
  },

  /**
   * Calculate hourly rate for 1-24 hour durations
   */
  calculateHourlyRate: function (
    car: Car,
    duration: number
  ): { cost: number; tier: string } {
    // For durations > 1 hour, round up to the nearest 15-minute increment (0.25 hour)
    const quarteredDuration = Math.ceil(duration * 4) / 4;
    
    // If duration is not a whole hour, calculate using 15-minute increments
    let hourlyPrice: number;
    if (Number.isInteger(quarteredDuration)) {
      // Whole hours
      hourlyPrice = quarteredDuration * car.pricing.hour;
    } else {
      // Mixed hours and 15-minute increments
      const wholeHours = Math.floor(quarteredDuration);
      const quarterHours = Math.round((quarteredDuration - wholeHours) * 4); // Number of 15-minute blocks
      
      // Calculate cost: whole hours plus quarter-hour increments
      hourlyPrice = (wholeHours * car.pricing.hour) + (quarterHours * (car.pricing.hour / 4));
    }

    // Check if daily rate would be cheaper than hourly
    if (car.pricing.day && car.pricing.day < hourlyPrice) {
      // Daily rate is cheaper
      return {
        cost: car.pricing.day,
        tier: "1 day",
      };
    } else {
      // Format the duration to display
      let tier;
      if (Number.isInteger(quarteredDuration)) {
        // Whole hours (e.g., 2 hours)
        tier = `${quarteredDuration} hour${quarteredDuration > 1 ? "s" : ""}`;
      } else {
        // Fractional hours (e.g., 1.25 hours or 2.5 hours)
        const formattedDuration = quarteredDuration
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/0+$/, "");
        tier = `${formattedDuration} hours`;
      }

      return {
        cost: hourlyPrice,
        tier,
      };
    }
  },

  /**
   * Calculate daily rate for 1-7 day durations
   */
  calculateDailyRate: function (
    car: Car,
    duration: number
  ): { cost: number; tier: string } {
    // Calculate days and remaining hours
    const days = Math.floor(duration / HOURS_PER_DAY);
    const remainingHours = duration % HOURS_PER_DAY;

    // Calculate price for full days
    const fullDaysPrice = days * car.pricing.day;

    // If no remaining hours, just return the full days price
    if (remainingHours === 0) {
      return {
        cost: fullDaysPrice,
        tier: `${days} day${days > 1 ? "s" : ""}`,
      };
    }

    // Calculate price for remaining hours
    const remainingHoursPrice = remainingHours * car.pricing.hour;
    const combinedPrice = fullDaysPrice + remainingHoursPrice;

    // Check if using one more full day is cheaper than day + hours
    const nextFullDayPrice = (days + 1) * car.pricing.day;

    if (nextFullDayPrice <= combinedPrice) {
      // Using full days is cheaper or same cost
      return {
        cost: nextFullDayPrice,
        tier: `${days + 1} day${days + 1 > 1 ? "s" : ""}`,
      };
    } else {
      // Using days + hours is cheaper
      return {
        cost: combinedPrice,
        tier: `${days} day${days > 1 ? "s" : ""} + ${this.formatTimeComponent(
          remainingHours
        )}`,
      };
    }
  },

  /**
   * Format a time component (hours or minutes) with appropriate units
   */
  formatTimeComponent: function (hours: number): string {
    if (hours < 1) {
      // Convert to minutes
      const mins = Math.round(hours * 60);
      return `${mins} min${mins > 1 ? "s" : ""}`;
    } else if (Number.isInteger(hours)) {
      // Whole hours
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      // Fractional hours
      const formattedHours = hours
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/0+$/, "");
      return `${formattedHours} hours`;
    }
  },

  /**
   * Calculate weekly rate for durations longer than 7 days
   */
  calculateWeeklyRate: function (
    car: Car,
    duration: number
  ): { cost: number; tier: string } {
    const weeks = Math.floor(duration / HOURS_PER_WEEK);
    const remainingHours = duration % HOURS_PER_WEEK;

    // Check if weekly pricing is available
    if (car.pricing.week) {
      // Weekly rate for full weeks
      let weeksCost = weeks * car.pricing.week;
      let remainingCost = 0;
      let tier = `${weeks} week${weeks > 1 ? "s" : ""}`;

      if (remainingHours > 0) {
        // For the remaining time, determine the best pricing option
        if (remainingHours <= 24) {
          // For remaining time up to 1 day
          if (remainingHours === 24) {
            // Exactly one day
            remainingCost = car.pricing.day;
            tier += ` + 1 day`;
          } else {
            // Less than a day - use hourly rate
            remainingCost = remainingHours * car.pricing.hour;
            tier += ` + ${this.formatTimeComponent(remainingHours)}`;
          }
        } else {
          // For remaining time more than 1 day
          const days = Math.floor(remainingHours / 24);
          const extraHours = remainingHours % 24;

          // Calculate cost for full days
          const daysCost = days * car.pricing.day;

          // Calculate cost for remaining hours if any
          let extraHoursCost = 0;
          if (extraHours > 0) {
            extraHoursCost = extraHours * car.pricing.hour;
            // Check if another full day is cheaper
            if (car.pricing.day < extraHoursCost) {
              extraHoursCost = car.pricing.day;
              tier += ` + ${days + 1} day${days + 1 > 1 ? "s" : ""}`;
            } else {
              tier += ` + ${days} day${
                days > 1 ? "s" : ""
              } + ${this.formatTimeComponent(extraHours)}`;
            }
          } else {
            tier += ` + ${days} day${days > 1 ? "s" : ""}`;
          }

          remainingCost = daysCost + extraHoursCost;
        }

        // Check if another full week would be cheaper than week + remaining time
        if (car.pricing.week <= remainingCost) {
          weeksCost += car.pricing.week;
          remainingCost = 0;
          tier = `${weeks + 1} week${weeks + 1 > 1 ? "s" : ""}`;
        }
      }

      return {
        cost: weeksCost + remainingCost,
        tier,
      };
    } else {
      // No weekly rate, fall back to daily rate
      const totalDays = Math.ceil(duration / HOURS_PER_DAY);
      return {
        cost: totalDays * car.pricing.day,
        tier: `${totalDays} day${totalDays > 1 ? "s" : ""} (no weekly rate)`,
      };
    }
  },

  /**
   * Determine free kilometer policy and calculate free kilometers
   */
  determineFreeKmPolicy: function (
    car: Car,
    company: Company,
    duration: number
  ): {
    freeKm: number;
    policyType: KmPolicyType;
  } {
    let policyType: KmPolicyType = KmPolicyType.standard;
    let unitCount: number = 1;

    // For companies with duration-based free km policies
    if (company.freeKmPolicy.hourly && duration <= HOURS_PER_DAY) {
      policyType = KmPolicyType.hourly;
      unitCount = duration;
    } else if (company.freeKmPolicy.daily && duration <= HOURS_PER_WEEK) {
      policyType = KmPolicyType.daily;
      unitCount = duration / HOURS_PER_DAY;
    } else if (company.freeKmPolicy.weekly && duration > HOURS_PER_DAY) {
      policyType = KmPolicyType.weekly;
      unitCount = duration / HOURS_PER_WEEK;
    } else {
      // Default to standard policy when no specific duration policy applies
      policyType = KmPolicyType.standard;
      unitCount = 1;
    }

    // Calculate free kilometers based on the determined policy
    const freeKm = this.calculateFreeKm(car, company, unitCount, policyType);

    return { freeKm, policyType };
  },

  /**
   * Calculate free kilometers based on policy type and duration
   */
  calculateFreeKm: function (
    car: Car,
    company: Company,
    unitCount: number,
    policyType: KmPolicyType
  ): number {
    // Get the base rate from company policy
    const baseRate = company.freeKmPolicy[policyType];

    // If the policy doesn't exist, return 0
    if (baseRate === undefined) {
      return 0;
    }

    // Check if car has override for this policy type
    let specificRate = baseRate;
    if (car.freeKmPolicy && car.freeKmPolicy[policyType] !== undefined) {
      specificRate = car.freeKmPolicy[policyType]!;
    }

    // For standard policy, we don't multiply by duration
    if (policyType === "standard") {
      return specificRate;
    }

    // For duration-based policies, calculate total free km based on duration
    return Math.round(specificRate * unitCount);
  },

  /**
   * Helper function to capitalize first letter
   */
  capitalizeFirstLetter: function (string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};

// For browser usage
declare global {
  interface Window {
    CarShareCalculator: typeof CarShareCalculator;
  }
}

if (typeof window !== "undefined") {
  window.CarShareCalculator = CarShareCalculator;
}

// For Node.js/testing environment
export default CarShareCalculator;
