/**
 * Car Share Companies and Cars Data
 *
 * Data Structure:
 * - Companies have policies for free kilometers that may vary by duration
 * - Cars have specific pricing based on rental duration (hour, day, week)
 */

import { Car, Company } from "./types";

// Company data
export const companies: Company[] = [
  {
    id: "gocar",
    name: "GoCar",
    logo: "gocar.png",
    freeKmPolicy: {
      standard: 50, // Same value regardless of duration
    },
    defaultPricePerExtraKm: 0.25,
  },
  {
    id: "yuko",
    name: "Yuko",
    logo: "yuko.png",
    freeKmPolicy: {
      daily: 50, // Standard free km
      weekly: 300, // 300km free per week
    },
    defaultPricePerExtraKm: 0.25,
  },
  {
    id: "hertz",
    name: "Hertz 24/7",
    logo: "hertz.png",
    freeKmPolicy: {
      daily: 50, // Standard free km
    },
    defaultPricePerExtraKm: 0.25,
  },
  {
    id: "enterprise-standard",
    name: "Enterprise Standard",
    logo: "enterprise.jpeg",
    freeKmPolicy: {
      standard: 0,
    },
    defaultPricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-standard-plus",
    name: "Enterprise Standard+",
    logo: "enterprise.jpeg",
    freeKmPolicy: {
      daily: 50, // Standard free km
    },
    defaultPricePerExtraKm: 0.2,
  },
];

// Car data - includes company-specific cars with their pricing
export const cars: Car[] = [
  // GoCar vehicles
  {
    id: "gocar-golocal",
    name: "GoLocal (i10)",
    company: "gocar",
    type: "economy",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 50.0,
      // No weekly rate available
    },
    notes: "Compact city car, perfect for short trips around town",
  },
  {
    id: "gocar-golocal-auto",
    name: "GoLocal (i10)",
    company: "gocar",
    type: "economy",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0, // €9+€1 additional for automatic
      day: 55.0, // €50+€5 additional for automatic
      // No weekly rate available
    },
    notes: "Compact automatic city car, perfect for short trips around town",
  },
  {
    id: "gocar-gocity",
    name: "GoCity (i20/Clio/Micra)",
    company: "gocar",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 11.0,
      day: 55.0,
      // No weekly rate available
    },
    notes: "Small cars, perfect for city driving",
  },
  {
    id: "gocar-gocity-auto",
    name: "GoCity Automatic",
    company: "gocar",
    type: "compact",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0, // €11+€1 additional for automatic
      day: 60.0, // €55+€5 additional for automatic
      // No weekly rate available
    },
    notes: "Small automatic cars, perfect for city driving",
  },
  {
    id: "gocar-gotripper",
    name: "GoTripper (Scala/i30)",
    company: "gocar",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 60.0,
      // No weekly rate available
    },
    notes: "Larger hatchbacks with more space for luggage and passengers",
  },
  {
    id: "gocar-goexplore",
    name: "GoExplore (Captur/Kamiq)",
    company: "gocar",
    type: "standard",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 65.0,
      // No weekly rate available
    },
    notes:
      "Subcompact crossover SUVs, perfect for longer journeys with extra space",
  },
  {
    id: "gocar-goexplore-plus",
    name: "GoExplore PLUS (Seat Ateca)",
    company: "gocar",
    type: "premium",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 15.0,
      day: 80.0,
      // No weekly rate available
    },
    freeKmPolicy: {
      standard: 75, // Override company policy - extra 25km free
    },
    notes:
      "Larger SUV vehicles with additional space and comfort for longer journeys",
  },
  {
    id: "gocar-goelectric",
    name: "GoElectric (Kona EV)",
    company: "gocar",
    type: "standard",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 14.0,
      day: 70.0,
      // No weekly rate available
    },
    notes: "Fully electric vehicle with automatic transmission",
  },
  {
    id: "gocar-golocal-electric",
    name: "GoLocal Electric (e-Up!)",
    company: "gocar",
    type: "economy",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 10.0,
      day: 55.0,
      // No weekly rate available
    },
    notes: "Fully electric city cars with automatic transmission",
  },
  {
    id: "gocar-govan",
    name: "GoVan (Citroen Berlingo)",
    company: "gocar",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 60.0,
      // No weekly rate available
    },
    notes: "Small vans with plenty of space for moving items",
  },
  {
    id: "gocar-goseven",
    name: "GoSeven (7 Seater)",
    company: "gocar",
    type: "premium",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 15.0,
      day: 85.0,
      // No weekly rate available
    },
    notes: "Large 7-seater passenger vehicle for family trips",
  },

  // Yuko vehicles
  {
    id: "yuko-aygo",
    name: "Aygo X",
    company: "yuko",
    type: "economy",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 52.0,
      week: 345.0,
    },
    notes: "Compact city car",
  },
  {
    id: "yuko-yaris",
    name: "Yaris",
    company: "yuko",
    type: "compact",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0,
      day: 58.0,
      week: 375.0,
    },
    notes: "Reliable compact car",
  },
  {
    id: "yuko-yaris-cross",
    name: "Yaris Cross",
    company: "yuko",
    type: "compact",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 66.0,
      week: 420.0,
    },
    notes: "Compact crossover SUV",
  },
  {
    id: "yuko-corolla-hatchback",
    name: "Corolla Hatchback",
    company: "yuko",
    type: "standard",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 66.0,
      week: 420.0,
    },
    notes: "Spacious hatchback",
  },
  {
    id: "yuko-corolla-saloon",
    name: "Corolla Saloon",
    company: "yuko",
    type: "standard",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 66.0,
      week: 420.0,
    },
    notes: "Comfortable saloon",
  },
  {
    id: "yuko-chr",
    name: "C-HR",
    company: "yuko",
    type: "standard",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 75.0,
      week: 455.0,
    },
    notes: "Stylish crossover",
  },
  {
    id: "yuko-bz4x",
    name: "bZ4X Electric Vehicle",
    company: "yuko",
    type: "premium",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 13.0,
      day: 75.0,
      week: 455.0,
    },
    notes: "Electric SUV",
  },
  {
    id: "yuko-corolla-cross",
    name: "Corolla Cross",
    company: "yuko",
    type: "premium",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 80.0,
      week: 510.0,
    },
    notes: "Crossover SUV",
  },
  {
    id: "yuko-proace-city",
    name: "Proace City",
    company: "yuko",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 60.0,
      week: 386.0,
    },
    notes: "Compact van",
  },
  {
    id: "yuko-proace-city-lwb",
    name: "Proace City LWB",
    company: "yuko",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 69.0,
      week: 430.0,
    },
    notes: "Long wheel base van",
  },

  // Hertz 24/7 vehicles
  {
    id: "hertz-vw-golf",
    name: "Volkswagen Golf",
    company: "hertz",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9,
      day: 50,
    },
  },
  {
    id: "hertz-renault-captur",
    name: "Renault Captur",
    company: "hertz",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9,
      day: 50,
    },
  },
  {
    id: "hertz-bmw-ix3",
    name: "BMW iX3",
    company: "hertz",
    type: "premium",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 15.0,
      day: 80.0,
    },
  },

  // Enterprise Car Club - Standard+
  {
    id: "enterprise-small",
    name: "Toyota Aygo or similar",
    company: "enterprise-standard",
    type: "small",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 7.0,
      day: 37.8,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-economy",
    name: "Ford Fiesta or similar",
    company: "enterprise-standard",
    type: "economy",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 8.0,
      day: 43.2,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-economy-auto",
    name: "Ford Fiesta or similar",
    company: "enterprise-standard",
    type: "economy",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 48.6,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-standard",
    name: "Opel Astra or similar",
    company: "enterprise-standard",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 48.6,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-midsize-auto",
    name: "DA HY Corrolla HatchBack Auto or similar",
    company: "enterprise-standard",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 11.0,
      day: 59.4,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-compact-suv",
    name: "C SUV T-Rock or similar",
    company: "enterprise-standard",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0,
      day: 54,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-compact-suv-auto",
    name: "C SUV T-Rock Auto or similar",
    company: "enterprise-standard",
    type: "compact",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 11.0,
      day: 59.4,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-intermediate-suv",
    name: "ISUV HY C-HR or similar",
    company: "enterprise-standard",
    type: "premium",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 64.8,
    },
    pricePerExtraKm: 0.15,
  },
  {
    id: "enterprise-economy-van",
    name: "VW Caddy or similar",
    company: "enterprise-standard",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 48.6,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-standard-van",
    name: "Peugeot Expert or similar",
    company: "enterprise-standard",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 64.8,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-large-van",
    name: "Ford Transit or similar",
    company: "enterprise-standard",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 14,
      day: 75.6,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-ev-economy",
    name: "Renault Zoe or similar",
    company: "enterprise-standard",
    type: "economy",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 10.85,
      day: 58.6,
    },
    pricePerExtraKm: 0.09,
  },

  // Enterprise Car Club - Standard+
  {
    id: "enterprise-small",
    name: "Toyota Aygo or similar",
    company: "enterprise-standard-plus",
    type: "small",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 8.0,
      day: 43.2,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-economy",
    name: "Ford Fiesta or similar",
    company: "enterprise-standard-plus",
    type: "economy",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 9.0,
      day: 48.6,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-economy-auto",
    name: "Ford Fiesta or similar",
    company: "enterprise-standard-plus",
    type: "economy",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0,
      day: 54.0,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-standard",
    name: "Opel Astra or similar",
    company: "enterprise-standard-plus",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0,
      day: 54.0,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-midsize-auto",
    name: "DA HY Corrolla HatchBack Auto or similar",
    company: "enterprise-standard-plus",
    type: "standard",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 64.8,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-compact-suv",
    name: "C SUV T-Rock or similar",
    company: "enterprise-standard-plus",
    type: "compact",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 11.0,
      day: 59.4,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-compact-suv-auto",
    name: "C SUV T-Rock Auto or similar",
    company: "enterprise-standard-plus",
    type: "compact",
    transmission: "automatic",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 12.0,
      day: 64.8,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-intermediate-suv",
    name: "ISUV HY C-HR or similar",
    company: "enterprise-standard-plus",
    type: "premium",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 70.2,
    },
    pricePerExtraKm: 0.2,
  },
  {
    id: "enterprise-economy-van",
    name: "VW Caddy or similar",
    company: "enterprise-standard-plus",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 10.0,
      day: 54.0,
    },
    pricePerExtraKm: 0.25,
  },
  {
    id: "enterprise-standard-van",
    name: "Peugeot Expert or similar",
    company: "enterprise-standard-plus",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 13.0,
      day: 70.2,
    },
    pricePerExtraKm: 0.25,
  },
  {
    id: "enterprise-large-van",
    name: "Ford Transit or similar",
    company: "enterprise-standard-plus",
    type: "van",
    transmission: "manual",
    fuelType: "petrol-diesel",
    pricing: {
      hour: 15.0,
      day: 81.0,
    },
    pricePerExtraKm: 0.25,
  },
  {
    id: "enterprise-ev-economy",
    name: "Renault Zoe or similar",
    company: "enterprise-standard-plus",
    type: "economy",
    transmission: "automatic",
    fuelType: "electric",
    pricing: {
      hour: 11.85,
      day: 64.0,
    },
    pricePerExtraKm: 0.09,
  },
];

// For browser usage
declare global {
  var companies: Company[];
  var cars: Car[];
}

if (typeof window !== "undefined") {
  window.companies = companies;
  window.cars = cars;
}
