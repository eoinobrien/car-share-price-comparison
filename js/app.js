/**
 * Car Share Price Comparison Application
 * 
 * This script handles the calculation of car share prices based on 
 * duration and distance traveled.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const comparisonForm = document.getElementById('comparison-form');
    const durationInput = document.getElementById('duration');
    const kilometersInput = document.getElementById('kilometers');
    const carTypeSelect = document.getElementById('car-type');
    const transmissionSelect = document.getElementById('transmission');
    const resultsContainer = document.getElementById('results-container');
    const filterToggle = document.getElementById('filter-toggle');
    const advancedFilters = document.getElementById('advanced-filters');
    const sortSelect = document.getElementById('sort-by');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Initialize advanced filters toggle
    filterToggle.addEventListener('click', function() {
        this.classList.toggle('expanded');
        advancedFilters.classList.toggle('show');
        this.textContent = advancedFilters.classList.contains('show') ? 'Hide Options' : 'Show More Options';
    });
    
    // Initialize sort functionality
    sortSelect.addEventListener('change', function() {
        // Re-sort existing results without recalculating
        sortAndDisplayResults(currentResults);
    });
    
    // Store current results for sorting without recalculation
    let currentResults = [];
    
    // Add input validation visual feedback
    function validateInput(input) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            input.classList.add('invalid');
            return false;
        } else {
            input.classList.remove('invalid');
            return true;
        }
    }

    // Add event listeners for input validation
    durationInput.addEventListener('blur', function() {
        validateInput(this);
    });
    
    kilometersInput.addEventListener('blur', function() {
        validateInput(this);
    });

    // Add event listeners for input changes to calculate prices automatically
    durationInput.addEventListener('input', debounce(calculatePrices, 500));
    kilometersInput.addEventListener('input', debounce(calculatePrices, 500));
    carTypeSelect.addEventListener('change', calculatePrices);
    transmissionSelect.addEventListener('change', calculatePrices);

    // Keep the form submission event listener for when users press Enter
    comparisonForm.addEventListener('submit', function(event) {
        event.preventDefault();
        calculatePrices();
    });
    
    // Simple debounce function to prevent excessive calculations while typing
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Calculate prices for all cars based on user input
     */
    function calculatePrices() {
        // Show loading indicator
        loadingIndicator.classList.add('show');
        resultsContainer.innerHTML = '';
        
        // Use setTimeout to give the browser time to render the loading indicator
        setTimeout(() => {
            // Get user input values
            const duration = parseFloat(durationInput.value);
            const kilometers = parseFloat(kilometersInput.value);
            const selectedCarType = carTypeSelect.value;
            const selectedTransmission = transmissionSelect.value;

            // Validate inputs
            const isDurationValid = validateInput(durationInput);
            const isKilometersValid = validateInput(kilometersInput);
            if (!isDurationValid || !isKilometersValid) {
                loadingIndicator.classList.remove('show');
                return; // Don't calculate if inputs are invalid
            }

            // Enforce minimum booking duration of 1 hour
            const effectiveDuration = Math.max(1, duration);
            
            // If the user entered less than 1 hour, prepare a message
            let minDurationMessage = null;
            if (duration < 1) {
                minDurationMessage = document.createElement('div');
                minDurationMessage.className = 'min-duration-notice';
                minDurationMessage.innerHTML = '<strong>Note:</strong> All providers require a minimum booking of 1 hour. Prices shown are for 1 hour rentals.';
            }

            // Filter cars based on selected car type and transmission
            let filteredCars = cars;
            if (selectedCarType !== 'all') {
                filteredCars = filteredCars.filter(car => car.type === selectedCarType);
            }
            if (selectedTransmission !== 'all') {
                filteredCars = filteredCars.filter(car => car.transmission === selectedTransmission);
            }

            // Calculate prices for each car
            currentResults = filteredCars.map(car => {
                const company = companies.find(company => company.id === car.company);
                const priceData = calculateCarPrice(car, company, effectiveDuration, kilometers);
                
                return {
                    car: car,
                    company: company,
                    ...priceData
                };
            });

            // Sort and display results
            sortAndDisplayResults(currentResults, minDurationMessage);
        }, 300); // Short timeout for loading effect
    }
    
    /**
     * Sort and display results based on current sort selection
     * @param {Array} results - Price calculation results
     * @param {HTMLElement} minDurationMessage - Optional message to display
     */
    function sortAndDisplayResults(results, minDurationMessage = null) {
        // Sort results based on selected sort criteria
        const sortBy = sortSelect.value;
        
        switch (sortBy) {
            case 'price':
                results.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            case 'price-desc':
                results.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case 'company':
                results.sort((a, b) => a.company.name.localeCompare(b.company.name));
                break;
            case 'car-type':
                results.sort((a, b) => {
                    // First sort by car type
                    const typeComparison = a.car.type.localeCompare(b.car.type);
                    // If same type, sort by price
                    return typeComparison !== 0 ? typeComparison : a.totalPrice - b.totalPrice;
                });
                break;
        }
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Add minimum duration message if provided
        if (minDurationMessage) {
            resultsContainer.appendChild(minDurationMessage);
        }
        
        // Find the best deal (lowest price) to highlight
        let bestDealPrice = Infinity;
        if (results.length > 0) {
            bestDealPrice = Math.min(...results.map(r => r.totalPrice));
        }
        
        // Display results
        results.forEach(result => {
            displayCarResult(result, result.totalPrice === bestDealPrice);
        });

        // Show message if no cars match the filters
        if (results.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results';
            noResultsMessage.textContent = 'No cars match the selected filters. Please try different filter options.';
            resultsContainer.appendChild(noResultsMessage);
        }
        
        // Hide loading indicator
        loadingIndicator.classList.remove('show');
    }

    /**
     * Calculate price for a specific car
     * @param {Object} car - Car object
     * @param {Object} company - Company object
     * @param {number} duration - Trip duration in hours
     * @param {number} kilometers - Trip distance in kilometers
     * @returns {Object} Price calculation data
     */
    function calculateCarPrice(car, company, duration, kilometers) {
        // Determine the appropriate pricing tier based on duration
        let timeCost, pricingTier;
        
        // Choose pricing tier based on duration
        if (duration <= 1) {
            // For short trips up to 1 hour
            
            // For GoCar, minimum booking is 1 hour
            if (company.id === 'gocar') {
                timeCost = car.pricing.hour;
                pricingTier = "1 hour (minimum)";
            } else {
                // For other companies that allow shorter bookings
                if (duration <= 0.25) {
                    // Single 15-minute period
                    timeCost = car.pricing.fifteenMin;
                    pricingTier = "15 min";
                } else {
                    // Multiple 15-minute periods or full hour
                    const hourlyPrice = car.pricing.hour;
                    if (duration == 1 || hourlyPrice < (Math.ceil(duration * 4) * car.pricing.fifteenMin)) {
                        // Full hour or hourly rate is cheaper than per-15-min rate
                        timeCost = hourlyPrice;
                        pricingTier = "hourly";
                    } else {
                        // Per 15-minute pricing
                        const periods = Math.ceil(duration * 4);
                        timeCost = periods * car.pricing.fifteenMin;
                        pricingTier = `${periods} x 15 min`;
                    }
                }
            }
        } else if (duration <= 24) {
            // Hourly rate for 1-24 hours
            
            // Check if daily rate would be cheaper than hourly
            const hourlyPrice = duration * car.pricing.hour;
            if (car.pricing.day && car.pricing.day < hourlyPrice) {
                // Daily rate is cheaper
                timeCost = car.pricing.day;
                pricingTier = "1 day";
            } else {
                // Hourly rate is cheaper or daily rate not available
                // Show exact duration (like 1.25 hours) rather than rounding up
                timeCost = hourlyPrice;
                
                // Format the duration to display
                if (Number.isInteger(duration)) {
                    // Whole hours (e.g., 2 hours)
                    pricingTier = `${duration} hour${duration > 1 ? 's' : ''}`;
                } else {
                    // Fractional hours (e.g., 1.25 hours or 2.5 hours)
                    const formattedDuration = duration.toFixed(2).replace(/\.00$/, '').replace(/0+$/, '');
                    pricingTier = `${formattedDuration} hours`;
                }
            }
        } else if (duration <= 168) {
            // Daily rate for 1-7 days
            // Calculate days and remaining hours
            const days = Math.floor(duration / 24);
            const remainingHours = duration % 24;
            
            // Check if combining daily + hourly rates might be cheaper than multiple days
            const fullDaysPrice = days * car.pricing.day;
            const remainingHoursPrice = Math.min(car.pricing.day, remainingHours * car.pricing.hour);
            const combinedPrice = fullDaysPrice + remainingHoursPrice;
            
            // Check if using one more full day is cheaper than day + hours
            const nextFullDayPrice = (days + 1) * car.pricing.day;
            
            if (nextFullDayPrice <= combinedPrice) {
                // Using full days is cheaper
                timeCost = nextFullDayPrice;
                pricingTier = `${days + 1} days`;
            } else {
                // Using days + hours is cheaper
                timeCost = combinedPrice;
                if (remainingHours > 0) {
                    if (remainingHours < 1) {
                        // Handle case when remaining time is less than 1 hour
                        const mins = Math.round(remainingHours * 60);
                        pricingTier = `${days} day${days > 1 ? 's' : ''} + ${mins} min${mins > 1 ? 's' : ''}`;
                    } else if (Number.isInteger(remainingHours)) {
                        // Whole remaining hours
                        pricingTier = `${days} day${days > 1 ? 's' : ''} + ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
                    } else {
                        // Fractional remaining hours
                        const formattedHours = remainingHours.toFixed(2).replace(/\.00$/, '').replace(/0+$/, '');
                        pricingTier = `${days} day${days > 1 ? 's' : ''} + ${formattedHours} hours`;
                    }
                } else {
                    pricingTier = `${days} day${days > 1 ? 's' : ''}`;
                }
            }
        } else {
            // Weekly rate for more than 7 days
            const weeks = Math.floor(duration / 168);
            const remainingDays = Math.ceil((duration % 168) / 24);
            
            // Check if weekly pricing is available
            if (car.pricing.week) {
                // Weekly rate plus additional days
                let weeksCost = weeks * car.pricing.week;
                let remainingCost = 0;
                
                if (remainingDays > 0) {
                    // Calculate remaining days at daily rate, but check if another week is cheaper
                    const daysAtDailyRate = remainingDays * car.pricing.day;
                    const additionalWeek = car.pricing.week;
                    
                    remainingCost = Math.min(daysAtDailyRate, additionalWeek);
                    
                    if (daysAtDailyRate <= additionalWeek) {
                        pricingTier = `${weeks} week${weeks > 1 ? 's' : ''} + ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                    } else {
                        pricingTier = `${weeks + 1} week${weeks + 1 > 1 ? 's' : ''}`;
                    }
                } else {
                    pricingTier = `${weeks} week${weeks > 1 ? 's' : ''}`;
                }
                
                timeCost = weeksCost + remainingCost;
            } else {
                // No weekly rate, fall back to daily rate
                const totalDays = Math.ceil(duration / 24);
                timeCost = totalDays * car.pricing.day;
                pricingTier = `${totalDays} day${totalDays > 1 ? 's' : ''} (no weekly rate)`;
            }
        }

        // Determine free kilometers policy
        let freeKm, policyType;
        
        // For Drive You, use their duration-based free km policies
        if (company.id === 'driveyou' || company.id === "yuko") {
            if (duration <= 24 && company.id === 'driveyou') {
                policyType = 'hourly';
                freeKm = calculateFreeKm(car, company, duration, policyType);
            } else if (duration <= 168) {
                policyType = 'daily';
                freeKm = calculateFreeKm(car, company, duration / 24, policyType);
            } else {
                policyType = 'weekly';
                freeKm = calculateFreeKm(car, company, duration / 168, policyType);
            }
        } else {
            policyType = 'standard';
            freeKm = calculateFreeKm(car, company, 1, policyType);
        }
        
        // Determine price per extra km
        const pricePerExtraKm = car.pricePerExtraKm !== undefined ? car.pricePerExtraKm : company.defaultPricePerExtraKm;
        
        // Calculate distance-based cost
        let distanceCost = 0;
        if (kilometers > freeKm) {
            distanceCost = (kilometers - freeKm) * pricePerExtraKm;
        }

        // Calculate total price
        const totalPrice = timeCost + distanceCost;

        return {
            timeCost,
            distanceCost,
            totalPrice,
            freeKm,
            pricePerExtraKm,
            policyType,
            pricingTier
        };
    }
    
    /**
     * Calculate optimal price between two tiers
     * @param {Object} car - Car object
     * @param {number} units - Number of smaller units (hours or days)
     * @param {number} unitsInLarger - Number of smaller units in larger unit (24 hours in a day)
     * @param {string} smallerTier - Smaller tier name ('hour' or 'day')
     * @param {number} maxLargerUnits - Max number of larger units to consider
     * @param {string} largerTier - Larger tier name ('day' or 'week')
     * @returns {Object} Optimal price and tier used
     */
    function calculateOptimalPrice(car, units, unitsInLarger, smallerTier, maxLargerUnits, largerTier) {
        // Calculate cost at the smaller tier rate
        const smallerRate = car.pricing[smallerTier];
        const smallerTierTotal = Math.ceil(units) * smallerRate;
        
        // Check if larger tier is available
        if (car.pricing[largerTier]) {
            // Calculate how many full larger units and remaining smaller units
            const largerUnits = Math.floor(units / unitsInLarger);
            const remainingSmaller = Math.ceil(units % unitsInLarger);
            
            if (largerUnits >= 1) {
                // Calculate cost with larger tier + remaining smaller tier
                const largerTierCost = largerUnits * car.pricing[largerTier];
                const remainingCost = remainingSmaller > 0 ? remainingSmaller * smallerRate : 0;
                const combinedCost = largerTierCost + remainingCost;
                
                // Check if using just larger tier units is cheaper
                const nextLargerUnit = (largerUnits + (remainingSmaller > 0 ? 1 : 0));
                if (nextLargerUnit <= maxLargerUnits) {
                    const nextLargerTierCost = nextLargerUnit * car.pricing[largerTier];
                    
                    if (nextLargerTierCost < combinedCost) {
                        // Full larger tier units is cheaper
                        return { price: nextLargerTierCost, tier: `${nextLargerUnit} ${largerTier}${nextLargerUnit > 1 ? 's' : ''}` };
                    }
                }
                
                // Combined tier pricing is optimal
                const tierStr = `${largerUnits} ${largerTier}${largerUnits > 1 ? 's' : ''}${remainingSmaller > 0 ? ' + ' + remainingSmaller + ' ' + smallerTier + (remainingSmaller > 1 ? 's' : '') : ''}`;
                return { price: combinedCost, tier: tierStr };
            }
        }
        
        // Default to smaller tier pricing
        return { price: smallerTierTotal, tier: `${Math.ceil(units)} ${smallerTier}${Math.ceil(units) > 1 ? 's' : ''}` };
    }
    
    /**
     * Calculate free kilometers based on policy type and duration
     * @param {Object} car - Car object
     * @param {Object} company - Company object
     * @param {number} unitCount - Number of units (hours/days/weeks/standard)
     * @param {string} policyType - Type of policy (hourly, daily, weekly, standard)
     * @returns {number} Free kilometers allowed
     */
    function calculateFreeKm(car, company, unitCount, policyType) {
        // Get the base rate from company policy
        const baseRate = company.freeKmPolicy[policyType];
        
        // Check if car has override for this policy type
        let specificRate = baseRate;
        if (car.freeKmPolicy && car.freeKmPolicy[policyType] !== undefined) {
            specificRate = car.freeKmPolicy[policyType];
        }
        
        // For standard policy, we don't multiply by duration
        if (policyType === 'standard') {
            return specificRate;
        }
        
        // For duration-based policies, calculate total free km based on duration
        return Math.ceil(specificRate * unitCount);
    }

    /**
     * Display car price result in the UI
     * @param {Object} result - Price calculation result
     * @param {boolean} isBestDeal - Whether this is the best deal (lowest price)
     */
    function displayCarResult(result, isBestDeal = false) {
        const { car, company, timeCost, distanceCost, totalPrice, freeKm, pricePerExtraKm, policyType, pricingTier } = result;
        
        // Create result card element
        const cardElement = document.createElement('div');
        cardElement.className = 'car-card';
        
        // Mark as best deal if applicable
        if (isBestDeal) {
            cardElement.classList.add('best-deal');
            // Add 'Best Deal' ribbon
            const bestDealTag = document.createElement('div');
            bestDealTag.className = 'best-deal-tag';
            bestDealTag.textContent = 'BEST DEAL';
            cardElement.appendChild(bestDealTag);
        }
        
        // Format currency
        const formatCurrency = (value) => {
            return '€' + value.toFixed(2);
        };
        
        // Create free km display message
        let freeKmMessage = `${freeKm} km`;
        
        // Add policy information for Drive You's duration-based policies
        if (company.id === 'driveyou') {
            switch(policyType) {
                case 'hourly':
                    const hourlyRate = car.freeKmPolicy?.hourly || company.freeKmPolicy.hourly;
                    freeKmMessage = `${freeKm} km (${hourlyRate} per hour)`;
                    break;
                case 'daily':
                    const dailyRate = car.freeKmPolicy?.daily || company.freeKmPolicy.daily;
                    freeKmMessage = `${freeKm} km (${dailyRate} per day)`;
                    break;
                case 'weekly':
                    const weeklyRate = car.freeKmPolicy?.weekly || company.freeKmPolicy.weekly;
                    freeKmMessage = `${freeKm} km (${weeklyRate} per week)`;
                    break;
            }
        }
        
        // Populate card with car details and prices
        cardElement.innerHTML = `
            <div class="company">
                <div class="company-logo"><img src="images/${company.id}.png" role="presentation" /></div>
                ${company.name}
            </div>
            <h3>${car.name}</h3>
            <div class="details">
                <div><strong>Car Type:</strong> ${capitalizeFirstLetter(car.type)}</div>
                <div><strong>Transmission:</strong> ${capitalizeFirstLetter(car.transmission)}</div>
                <div><strong>Rate Applied:</strong> ${pricingTier} (${formatCurrency(timeCost)})</div>
                <div><strong>Free Kilometers:</strong> ${freeKmMessage}</div>
                <div><strong>Extra Km Rate:</strong> ${formatCurrency(pricePerExtraKm)} per km</div>
                ${car.notes ? `<div class="car-notes">${car.notes}</div>` : ''}
            </div>
            <div class="price">${formatCurrency(totalPrice)}</div>
            <div class="breakdown">
                <div>Time Cost: ${formatCurrency(timeCost)}</div>
                <div>Distance Cost: ${formatCurrency(distanceCost)}</div>
            </div>
        `;
        
        // Add card to results container
        resultsContainer.appendChild(cardElement);
    }
    
    /**
     * Save comparison to localStorage
     * @param {string} carId - Car ID to save
     * @param {number} price - Price of the car
     */
    function saveComparison(carId, price) {
        // Get existing saved comparisons or initialize empty array
        let savedComparisons = JSON.parse(localStorage.getItem('savedComparisons')) || [];
        
        // Check if already saved
        const existingIndex = savedComparisons.findIndex(item => item.carId === carId);
        
        if (existingIndex >= 0) {
            // Already saved - update with new price
            savedComparisons[existingIndex] = {
                carId,
                price: parseFloat(price),
                duration: parseFloat(durationInput.value),
                kilometers: parseFloat(kilometersInput.value),
                timestamp: new Date().toISOString()
            };
            alert('Comparison updated!');
        } else {
            // Add new saved comparison
            savedComparisons.push({
                carId,
                price: parseFloat(price),
                duration: parseFloat(durationInput.value),
                kilometers: parseFloat(kilometersInput.value),
                timestamp: new Date().toISOString()
            });
            alert('Comparison saved!');
        }
        
        // Save back to localStorage (maximum 10 saved comparisons)
        if (savedComparisons.length > 10) {
            savedComparisons = savedComparisons.slice(-10);
        }
        localStorage.setItem('savedComparisons', JSON.stringify(savedComparisons));
    }
    
    /**
     * Share comparison by generating URL with parameters
     * @param {string} carId - Car ID to share
     */
    function shareComparison(carId) {
        const duration = parseFloat(durationInput.value);
        const kilometers = parseFloat(kilometersInput.value);
        const carType = carTypeSelect.value;
        const transmission = transmissionSelect.value;
        
        // Generate URL with parameters
        const baseUrl = window.location.href.split('?')[0];
        const url = new URL(baseUrl);
        url.searchParams.set('duration', duration);
        url.searchParams.set('km', kilometers);
        url.searchParams.set('carId', carId);
        
        if (carType !== 'all') {
            url.searchParams.set('carType', carType);
        }
        
        if (transmission !== 'all') {
            url.searchParams.set('transmission', transmission);
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(url.toString())
            .then(() => {
                alert('Link copied to clipboard! Share it to show this comparison.');
            })
            .catch(err => {
                console.error('Failed to copy to clipboard:', err);
                alert('URL for sharing: ' + url.toString());
            });
    }

    /**
     * Helper function to capitalize first letter
     * @param {string} string - String to capitalize
     * @returns {string} Capitalized string
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Check for URL parameters and pre-fill form if found
     */
    function loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('duration')) {
            durationInput.value = urlParams.get('duration');
        }
        
        if (urlParams.has('km')) {
            kilometersInput.value = urlParams.get('km');
        }
        
        if (urlParams.has('carType')) {
            carTypeSelect.value = urlParams.get('carType');
            // Ensure advanced filters are shown if a filter is applied
            advancedFilters.classList.add('show');
            filterToggle.classList.add('expanded');
            filterToggle.textContent = 'Hide Options';
        }
        
        if (urlParams.has('transmission')) {
            transmissionSelect.value = urlParams.get('transmission');
            // Ensure advanced filters are shown if a filter is applied
            advancedFilters.classList.add('show');
            filterToggle.classList.add('expanded');
            filterToggle.textContent = 'Hide Options';
        }
    }
    
    // Load from URL parameters if any
    loadFromUrlParams();

    // Calculate prices on initial load with default values
    calculatePrices();
});