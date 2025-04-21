/**
 * Car Share Companies and Cars Data
 * 
 * Data Structure:
 * - Companies have policies for free kilometers that may vary by duration
 * - Cars have specific pricing based on rental duration (15 min, hour, day, week)
 */

import { Car, Company } from './types';

// Company data
export const companies: Company[] = [
    {
        id: "gocar",
        name: "GoCar",
        freeKmPolicy: {
            standard: 50  // Same value regardless of duration
        },
        defaultPricePerExtraKm: 0.25
    },
    {
        id: "yuko",
        name: "Yuko",
        freeKmPolicy: {
            daily: 50,    // Standard free km
            weekly: 300   // 300km free per week
        },
        defaultPricePerExtraKm: 0.25
    },
    {
        id: "driveyou",
        name: "Drive You",
        // Drive You has different free km policies based on rental duration
        freeKmPolicy: {
            hourly: 15,   // 15km free per hour
            daily: 50,    // 50km free per day
            weekly: 300   // 300km free per week
        },
        defaultPricePerExtraKm: 0.25
    }
];

// Car data - includes company-specific cars with their pricing
export const cars: Car[] = [
    // GoCar vehicles - pricing from untitled:Untitled-2
    {
        id: "gocar-golocal",
        name: "GoLocal (i10)",
        company: "gocar",
        type: "economy",
        transmission: "manual",
        pricing: {
            fifteenMin: 2.25, // €9 per hour / 4
            hour: 9.00,
            day: 50.00
            // No weekly rate available
        },
        notes: "Compact city car, perfect for short trips around town"
    },
    {
        id: "gocar-golocal-auto",
        name: "GoLocal (i10) Automatic",
        company: "gocar",
        type: "economy",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.50, // €10 per hour / 4
            hour: 10.00,      // €9+€1 additional for automatic
            day: 55.00        // €50+€5 additional for automatic
            // No weekly rate available
        },
        notes: "Compact automatic city car, perfect for short trips around town"
    },
    {
        id: "gocar-gocity",
        name: "GoCity (i20/Clio/Micra)",
        company: "gocar",
        type: "compact",
        transmission: "manual",
        pricing: {
            fifteenMin: 2.75, // €11 per hour / 4
            hour: 11.00,
            day: 55.00
            // No weekly rate available
        },
        notes: "Small cars, perfect for city driving"
    },
    {
        id: "gocar-gocity-auto",
        name: "GoCity Automatic",
        company: "gocar",
        type: "compact",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,      // €11+€1 additional for automatic
            day: 60.00        // €55+€5 additional for automatic
            // No weekly rate available
        },
        notes: "Small automatic cars, perfect for city driving"
    },
    {
        id: "gocar-gotripper",
        name: "GoTripper (Scala/i30)",
        company: "gocar",
        type: "standard",
        transmission: "manual",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00
            // No weekly rate available
        },
        notes: "Larger hatchbacks with more space for luggage and passengers"
    },
    {
        id: "gocar-goexplore",
        name: "GoExplore (Captur/Kamiq)",
        company: "gocar",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.25, // €13 per hour / 4
            hour: 13.00,
            day: 65.00
            // No weekly rate available
        },
        notes: "Subcompact crossover SUVs, perfect for longer journeys with extra space"
    },
    {
        id: "gocar-goexplore-plus",
        name: "GoExplore PLUS (Seat Ateca)",
        company: "gocar",
        type: "premium",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.75, // €15 per hour / 4
            hour: 15.00,
            day: 80.00
            // No weekly rate available
        },
        freeKmPolicy: {
            standard: 75 // Override company policy - extra 25km free
        },
        notes: "Larger SUV vehicles with additional space and comfort for longer journeys"
    },
    {
        id: "gocar-goelectric",
        name: "GoElectric (Kona EV)",
        company: "gocar",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.50, // €14 per hour / 4
            hour: 14.00,
            day: 70.00
            // No weekly rate available
        },
        notes: "Fully electric vehicle with automatic transmission"
    },
    {
        id: "gocar-golocal-electric",
        name: "GoLocal Electric (e-Up!)",
        company: "gocar",
        type: "economy",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.50, // €10 per hour / 4
            hour: 10.00,
            day: 55.00
            // No weekly rate available
        },
        notes: "Fully electric city cars with automatic transmission"
    },
    {
        id: "gocar-govan",
        name: "GoVan (Citroen Berlingo)",
        company: "gocar",
        type: "van",
        transmission: "manual",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00
            // No weekly rate available
        },
        notes: "Small vans with plenty of space for moving items"
    },
    {
        id: "gocar-goseven",
        name: "GoSeven (7 Seater)",
        company: "gocar",
        type: "premium",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.75, // €15 per hour / 4
            hour: 15.00,
            day: 85.00
            // No weekly rate available
        },
        notes: "Large 7-seater passenger vehicle for family trips"
    },

    // Yuko vehicles - pricing from untitled:Untitled-1
    {
        id: "yuko-aygo",
        name: "Aygo X",
        company: "yuko",
        type: "economy",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.25, // €9 per hour / 4
            hour: 9.00,
            day: 52.00,
            week: 345.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Compact city car"
    },
    {
        id: "yuko-yaris",
        name: "Yaris",
        company: "yuko",
        type: "compact",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.50, // €10 per hour / 4
            hour: 10.00,
            day: 58.00,
            week: 375.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Reliable compact car"
    },
    {
        id: "yuko-yaris-cross",
        name: "Yaris Cross",
        company: "yuko",
        type: "compact",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 66.00,
            week: 420.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Compact crossover SUV"
    },
    {
        id: "yuko-corolla-hatchback",
        name: "Corolla Hatchback",
        company: "yuko",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 66.00,
            week: 420.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Spacious hatchback"
    },
    {
        id: "yuko-corolla-saloon",
        name: "Corolla Saloon",
        company: "yuko",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 66.00,
            week: 420.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Comfortable saloon"
    },
    {
        id: "yuko-chr",
        name: "C-HR",
        company: "yuko",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.25, // €13 per hour / 4
            hour: 13.00,
            day: 75.00,
            week: 455.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Stylish crossover"
    },
    {
        id: "yuko-bz4x",
        name: "bZ4X Electric Vehicle",
        company: "yuko",
        type: "premium",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.25, // €13 per hour / 4
            hour: 13.00,
            day: 75.00,
            week: 455.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Electric SUV"
    },
    {
        id: "yuko-corolla-cross",
        name: "Corolla Cross",
        company: "yuko",
        type: "premium",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.25, // €13 per hour / 4
            hour: 13.00,
            day: 80.00,
            week: 510.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Crossover SUV"
    },
    {
        id: "yuko-proace-city",
        name: "Proace City",
        company: "yuko",
        type: "van",
        transmission: "manual",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00,
            week: 386.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Compact van"
    },
    {
        id: "yuko-proace-city-lwb",
        name: "Proace City LWB",
        company: "yuko",
        type: "van",
        transmission: "manual",
        pricing: {
            fifteenMin: 3.25, // €13 per hour / 4
            hour: 13.00,
            day: 69.00,
            week: 430.00
        },
        freeKmPolicy: {
            weekly: 300 // 300km free per week
        },
        notes: "Long wheel base van"
    },

    // Drive You vehicles - pricing from untitled:Untitled-3
    {
        id: "driveyou-i10",
        name: "i10",
        company: "driveyou",
        type: "economy",
        transmission: "manual",
        pricing: {
            fifteenMin: 2.25, // €9 per hour / 4
            hour: 9.00,
            day: 50.00,
            week: 330.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Compact economy car"
    },
    {
        id: "driveyou-i10-automatic",
        name: "i10 Automatic",
        company: "driveyou",
        type: "economy",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.50, // €10 per hour / 4
            hour: 10.00,
            day: 55.00,
            week: 365.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Compact automatic economy car"
    },
    {
        id: "driveyou-i20",
        name: "i20",
        company: "driveyou",
        type: "compact",
        transmission: "manual",
        pricing: {
            fifteenMin: 2.75, // €11 per hour / 4
            hour: 11.00,
            day: 55.00,
            week: 365.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Small cars, perfect for city driving"
    },
    {
        id: "driveyou-i20-automatic",
        name: "i20",
        company: "driveyou",
        type: "compact",
        transmission: "automatic",
        pricing: {
            fifteenMin: 2.75, // €11 per hour / 4
            hour: 11.00,
            day: 55.00,
            week: 365.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Small cars, perfect for city driving"
    },
    {
        id: "driveyou-i30-bayon",
        name: "i30/Bayon",
        company: "driveyou",
        type: "standard",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00,
            week: 385.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Midsize automatic car"
    },
    {
        id: "driveyou-kona-ev",
        name: "Kona EV",
        company: "driveyou",
        type: "premium",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00,
            week: 385.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Electric vehicle"
    },
    {
        id: "driveyou-staria-van",
        name: "Staria Van",
        company: "driveyou",
        type: "van",
        transmission: "automatic",
        pricing: {
            fifteenMin: 3.00, // €12 per hour / 4
            hour: 12.00,
            day: 60.00,
            week: 420.00
        },
        freeKmPolicy: {
            hourly: 15,  // 15km free per hour
            daily: 50,   // 50km free per day
            weekly: 300  // 300km free per week
        },
        notes: "Spacious automatic van"
    }
];

// For browser usage
declare global {
    var companies: Company[];
    var cars: Car[];
}

if (typeof window !== 'undefined') {
    window.companies = companies;
    window.cars = cars;
}