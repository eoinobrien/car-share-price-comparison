/**
 * Car Share Price Comparison Application
 * 
 * This script handles the calculation of car share prices based on 
 * duration and distance traveled.
 */

import CarShareCalculator from './carShareCalculator';
import { Car, Company, PriceResultWithDetails } from './types';
import { cars, companies } from './data';

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const comparisonForm = document.getElementById('comparison-form') as HTMLFormElement;
    const durationInput = document.getElementById('duration') as HTMLInputElement;
    const kilometersInput = document.getElementById('kilometers') as HTMLInputElement;
    const carTypeContainer = document.getElementById('car-type') as HTMLDivElement;
    const transmissionContainer = document.getElementById('transmission') as HTMLDivElement;
    const resultsContainer = document.getElementById('results-container') as HTMLDivElement;
    const filterToggle = document.getElementById('filter-toggle') as HTMLButtonElement;
    const advancedFilters = document.getElementById('advanced-filters') as HTMLDivElement;
    const sortSelect = document.getElementById('sort-by') as HTMLSelectElement;
    const loadingIndicator = document.getElementById('loading-indicator') as HTMLDivElement;

    // Get all checkbox elements
    const carTypeCheckboxes = carTypeContainer.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const transmissionCheckboxes = transmissionContainer.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    
    // Helper function to set up filter checkbox logic
    function setupFilterCheckboxes(checkboxes: NodeListOf<HTMLInputElement>): void {
        const allCheckbox = checkboxes[0]; // First checkbox is always 'All'
        
        // When 'All' is checked, uncheck others
        allCheckbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== allCheckbox) {
                        cb.checked = false;
                    }
                });
            } else {
                // If unchecking 'All' without selecting others, keep 'All' checked
                let anyOtherChecked = false;
                checkboxes.forEach(cb => {
                    if (cb !== allCheckbox && cb.checked) {
                        anyOtherChecked = true;
                    }
                });
                
                if (!anyOtherChecked) {
                    this.checked = true;
                }
            }
            calculatePrices();
        });
        
        // When any other checkbox is checked, uncheck 'All'
        checkboxes.forEach(cb => {
            if (cb !== allCheckbox) {
                cb.addEventListener('change', function() {
                    // When checking a specific option
                    if (this.checked) {
                        allCheckbox.checked = false;
                    } 
                    
                    // If no checkboxes are selected, re-check 'All'
                    let anyChecked = false;
                    checkboxes.forEach(innerCb => {
                        if (innerCb.checked) {
                            anyChecked = true;
                        }
                    });
                    
                    if (!anyChecked) {
                        allCheckbox.checked = true;
                    }
                    
                    calculatePrices();
                });
            }
        });
    }
    
    // Set up checkbox logic for both filters
    setupFilterCheckboxes(carTypeCheckboxes);
    setupFilterCheckboxes(transmissionCheckboxes);
    
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
    let currentResults: PriceResultWithDetails[] = [];
    
    // Add input validation visual feedback
    function validateInput(input: HTMLInputElement): boolean {
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

    // Keep the form submission event listener for when users press Enter
    comparisonForm.addEventListener('submit', function(event) {
        event.preventDefault();
        calculatePrices();
    });
    
    // Simple debounce function to prevent excessive calculations while typing
    function debounce(func: Function, delay: number): (...args: any[]) => void {
        let timeout: number | undefined;
        return function(this: any) {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = window.setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    /**
     * Helper function to get selected values from checkboxes
     */
    function getSelectedCheckboxValues(checkboxes: NodeListOf<HTMLInputElement>): string[] {
        const values: string[] = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                values.push(cb.value);
            }
        });
        return values;
    }

    /**
     * Calculate prices for all cars based on user input
     */
    function calculatePrices(): void {
        // Show loading indicator
        loadingIndicator.classList.add('show');
        resultsContainer.innerHTML = '';
        
        // Get user input values
        const duration = parseFloat(durationInput.value);
        const kilometers = parseFloat(kilometersInput.value);
        const selectedCarTypes = getSelectedCheckboxValues(carTypeCheckboxes);
        const selectedTransmissions = getSelectedCheckboxValues(transmissionCheckboxes);

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
        let minDurationMessage: HTMLDivElement | null = null;
        if (duration < 1) {
            minDurationMessage = document.createElement('div');
            minDurationMessage.className = 'min-duration-notice';
            minDurationMessage.innerHTML = '<strong>Note:</strong> All providers require a minimum booking of 1 hour. Prices shown are for 1 hour rentals.';
        }

        // Filter cars based on selected car types and transmissions
        let filteredCars = cars.slice();
        
        // Apply car type filter (if 'all' is selected, don't filter)
        if (!selectedCarTypes.includes('all')) {
            filteredCars = filteredCars.filter(car => selectedCarTypes.includes(car.type));
        }
        
        // Apply transmission filter (if 'all' is selected, don't filter)
        if (!selectedTransmissions.includes('all')) {
            filteredCars = filteredCars.filter(car => selectedTransmissions.includes(car.transmission));
        }

        // Calculate prices for each car
        currentResults = filteredCars.map(car => {
            const company = companies.find(company => company.id === car.company)!;
            const priceData = CarShareCalculator.calculateCarPrice(car, company, effectiveDuration, kilometers);
            
            return {
                car: car,
                company: company,
                ...priceData
            };
        });

        // Sort and display results
        sortAndDisplayResults(currentResults, minDurationMessage);
    }
    
    /**
     * Sort and display results based on current sort selection
     */
    function sortAndDisplayResults(results: PriceResultWithDetails[], minDurationMessage: HTMLDivElement | null = null): void {
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
     * Display car price result in the UI
     */
    function displayCarResult(result: PriceResultWithDetails, isBestDeal: boolean = false): void {
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
        const formatCurrency = (value: number): string => {
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
                <div><strong>Car Type:</strong> ${CarShareCalculator.capitalizeFirstLetter(car.type)}</div>
                <div><strong>Transmission:</strong> ${CarShareCalculator.capitalizeFirstLetter(car.transmission)}</div>
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
     */
    function saveComparison(carId: string, price: number): void {
        // Get existing saved comparisons or initialize empty array
        let savedComparisons = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
        
        // Check if already saved
        const existingIndex = savedComparisons.findIndex((item: any) => item.carId === carId);
        
        if (existingIndex >= 0) {
            // Already saved - update with new price
            savedComparisons[existingIndex] = {
                carId,
                price: parseFloat(price.toString()),
                duration: parseFloat(durationInput.value),
                kilometers: parseFloat(kilometersInput.value),
                timestamp: new Date().toISOString()
            };
            alert('Comparison updated!');
        } else {
            // Add new saved comparison
            savedComparisons.push({
                carId,
                price: parseFloat(price.toString()),
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
     */
    function shareComparison(carId: string): void {
        const duration = parseFloat(durationInput.value);
        const kilometers = parseFloat(kilometersInput.value);
        const selectedCarTypes = getSelectedCheckboxValues(carTypeCheckboxes);
        const selectedTransmissions = getSelectedCheckboxValues(transmissionCheckboxes);
        
        // Generate URL with parameters
        const baseUrl = window.location.href.split('?')[0];
        const url = new URL(baseUrl);
        url.searchParams.set('duration', duration.toString());
        url.searchParams.set('km', kilometers.toString());
        url.searchParams.set('carId', carId);
        
        if (!selectedCarTypes.includes('all')) {
            url.searchParams.set('carType', selectedCarTypes.join(','));
        }
        
        if (!selectedTransmissions.includes('all')) {
            url.searchParams.set('transmission', selectedTransmissions.join(','));
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
     * Check for URL parameters and pre-fill form if found
     */
    function loadFromUrlParams(): void {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('duration')) {
            durationInput.value = urlParams.get('duration')!;
        }
        
        if (urlParams.has('km')) {
            kilometersInput.value = urlParams.get('km')!;
        }
        
        if (urlParams.has('carType')) {
            const carTypes = urlParams.get('carType')!.split(',');
            
            // Uncheck "All" and check the specific car types
            const allCheckbox = document.getElementById('car-type-all') as HTMLInputElement;
            if (allCheckbox) {
                allCheckbox.checked = false;
            }
            
            carTypes.forEach(carType => {
                const specificCheckbox = document.getElementById(`car-type-${carType}`) as HTMLInputElement;
                if (specificCheckbox) {
                    specificCheckbox.checked = true;
                }
            });
            
            // Ensure advanced filters are shown if a filter is applied
            advancedFilters.classList.add('show');
            filterToggle.classList.add('expanded');
            filterToggle.textContent = 'Hide Options';
        }
        
        if (urlParams.has('transmission')) {
            const transmissions = urlParams.get('transmission')!.split(',');
            
            // Uncheck "All" and check the specific transmissions
            const allCheckbox = document.getElementById('transmission-all') as HTMLInputElement;
            if (allCheckbox) {
                allCheckbox.checked = false;
            }
            
            transmissions.forEach(transmission => {
                const specificCheckbox = document.getElementById(`transmission-${transmission}`) as HTMLInputElement;
                if (specificCheckbox) {
                    specificCheckbox.checked = true;
                }
            });
            
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