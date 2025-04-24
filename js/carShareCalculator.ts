/**
 * Car Share Price Calculator Module
 *
 * Encapsulates price calculation logic for car sharing services
 * to improve testability and separation of concerns.
 */

import { Car, Company, PriceCalculationResult } from "./types";

const HOURS_PER_DAY = 24;
const HOURS_PER_WEEK = 168;

const CarShareCalculator = {
  /**
   * Calculate price for a specific car using unified time breakdown approach
   */
  calculateCarPrice: function (
    car: Car,
    company: Company,
    duration: number,
    kilometers: number
  ): PriceCalculationResult {
    // Calculate time breakdown and time-based costs in one pass
    const timeBreakdown = this.calculateTimeBreakdown(car, duration);

    // Calculate free km based on the same time breakdown
    const freeKm = this.calculateFreeKmFromTimeBreakdown(
      car,
      company,
      timeBreakdown
    );

    // Determine price per extra km
    const pricePerExtraKm =
      car.pricePerExtraKm !== undefined
        ? car.pricePerExtraKm
        : company.defaultPricePerExtraKm;

    // Calculate distance-based cost
    const distanceCost =
      kilometers > freeKm ? (kilometers - freeKm) * pricePerExtraKm : 0;

    // Calculate total price
    const totalPrice = timeBreakdown.cost + distanceCost;

    return {
      timeCost: timeBreakdown.cost,
      distanceCost,
      totalPrice,
      freeKm,
      pricePerExtraKm,
      pricingTier: timeBreakdown.tier,
    };
  },

  /**
   * Calculate time breakdown into weeks, days, hours, and quarter hours
   * This is a unified function that returns both the cost and time components
   */
  calculateTimeBreakdown: function (
    car: Car,
    duration: number
  ): {
    weeks: number;
    days: number;
    hours: number;
    quarterHours: number;
    cost: number;
    tier: string;
  } {
    // Short trip (1 hour or less)
    if (duration <= 1) {
      return {
        weeks: 0,
        days: 0,
        hours: 1,
        quarterHours: 0,
        cost: car.pricing.hour,
        tier: "1 hour (minimum)",
      };
    }

    // For durations > 1 hour, calculate all components
    let weeks = 0;
    let days = 0;
    let hours = 0;
    let quarterHours = 0;
    let cost = 0;
    let tierParts: string[] = [];

    // Calculate raw time breakdown
    if (duration >= HOURS_PER_WEEK && car.pricing.week) {
      // Handle weekly component if available
      weeks = Math.floor(duration / HOURS_PER_WEEK);
      duration = duration % HOURS_PER_WEEK;

      const weeksCost = weeks * car.pricing.week;
      cost += weeksCost;
      if (weeks > 0) {
        tierParts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
      }
    }

    // Handle days component
    if (duration >= HOURS_PER_DAY) {
      days = Math.floor(duration / HOURS_PER_DAY);
      duration = duration % HOURS_PER_DAY;

      const daysCost = days * car.pricing.day;
      cost += daysCost;
      if (days > 0) {
        tierParts.push(`${days} day${days > 1 ? "s" : ""}`);
      }
    }

    // Handle remaining hours and minutes (quarter hours)
    if (duration > 0) {
      // Round up to the nearest quarter hour
      const quarteredDuration = Math.ceil(duration * 4) / 4;
      hours = Math.floor(quarteredDuration);
      quarterHours = Math.round((quarteredDuration - hours) * 4); // 0-3 representing 0, 15, 30, 45 minutes

      // Calculate cost for hours and quarter hours
      const hoursCost = hours * car.pricing.hour;
      const quarterHoursCost = quarterHours * (car.pricing.hour / 4);
      cost += hoursCost + quarterHoursCost;

      // Add to tier string
      if (hours > 0) {
        tierParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
      }
      if (quarterHours > 0) {
        tierParts.push(
          `${quarterHours * 15} min${quarterHours > 1 ? "s" : ""}`
        );
      }
    }

    // Apply optimizations (check if using a higher tier rate is cheaper)

    // Check if using another day would be cheaper than hours + quarter hours
    if (
      hours > 0 &&
      car.pricing.day <
        hours * car.pricing.hour + quarterHours * (car.pricing.hour / 4)
    ) {
      // Adding a day is cheaper than using hours
      days += 1;
      cost = weeks * (car.pricing.week || 0) + days * car.pricing.day;
      tierParts = [];
      if (weeks > 0) tierParts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
      if (days > 0) tierParts.push(`${days} day${days > 1 ? "s" : ""}`);
      hours = 0;
      quarterHours = 0;
    }

    // Check if using another week would be cheaper than days + hours
    if (
      car.pricing.week &&
      days > 0 &&
      car.pricing.week <
        days * car.pricing.day +
          hours * car.pricing.hour +
          quarterHours * (car.pricing.hour / 4)
    ) {
      // Adding a week is cheaper than using days + hours
      weeks += 1;
      cost = weeks * car.pricing.week;
      tierParts = [`${weeks} week${weeks > 1 ? "s" : ""}`];
      days = 0;
      hours = 0;
      quarterHours = 0;
    }

    return {
      weeks,
      days,
      hours,
      quarterHours,
      cost,
      tier: tierParts.join(" + "),
    };
  },

  /**
   * Calculate free kilometers based on time breakdown
   */
  calculateFreeKmFromTimeBreakdown: function (
    car: Car,
    company: Company,
    timeBreakdown: {
      weeks: number;
      days: number;
      hours: number;
      quarterHours: number;
    }
  ): number {
    const companyPolicy = company.freeKmPolicy;
    const carPolicy = car.freeKmPolicy;

    // Use the policy hierarchy: car-specific policy overrides company policy
    const policy = {
      weekly:
        carPolicy?.weekly !== undefined
          ? carPolicy.weekly
          : companyPolicy.weekly,
      daily:
        carPolicy?.daily !== undefined ? carPolicy.daily : companyPolicy.daily,
      hourly:
        carPolicy?.hourly !== undefined
          ? carPolicy.hourly
          : companyPolicy.hourly,
      quarterHours:
        carPolicy?.quarterHours !== undefined
          ? carPolicy.quarterHours
          : companyPolicy.quarterHours,
      standard:
        carPolicy?.standard !== undefined
          ? carPolicy.standard
          : companyPolicy.standard,
    };

    let totalFreeKm = 0;

    // Add weekly allocation
    if (timeBreakdown.weeks > 0 && policy.weekly !== undefined) {
      totalFreeKm += timeBreakdown.weeks * policy.weekly;
    }

    // Add daily allocation - count any partial day as a full day for free km
    if (policy.daily !== undefined) {
      let totalDays = timeBreakdown.days;

      if (
        policy.hourly === undefined &&
        policy.quarterHours === undefined &&
        policy.standard === undefined
      ) {
        // If we have any hours or quarter hours, count as an additional day for free km
        if (timeBreakdown.hours > 0 || timeBreakdown.quarterHours > 0) {
          totalDays += 1;
        }

        // Ensure at least 1 day for any booking
        totalDays = Math.max(1, totalDays);
      }

      totalFreeKm += totalDays * policy.daily;
    }

    // Add hourly allocation
    if (timeBreakdown.hours > 0 && policy.hourly !== undefined) {
      totalFreeKm += timeBreakdown.hours * policy.hourly;
    }

    // Add quarter hourly allocation
    if (timeBreakdown.quarterHours > 0 && policy.quarterHours !== undefined) {
      totalFreeKm += timeBreakdown.quarterHours * policy.quarterHours;
    }

    // If no specific allocations or total is 0, use standard
    if (totalFreeKm === 0 && policy.standard !== undefined) {
      totalFreeKm = policy.standard;
    }

    return Math.round(totalFreeKm);
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
