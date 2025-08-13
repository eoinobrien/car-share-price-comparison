/**
 * Car Share Price Comparison Application
 *
 * This script handles the calculation of car share prices based on
 * duration and distance traveled.
 */

import CarShareCalculator from "./carShareCalculator";
import { Car, Company, PriceResultWithDetails } from "./types";
import { cars, companies } from "./data";

document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const comparisonForm = document.getElementById(
    "comparison-form"
  ) as HTMLFormElement;
  const durationDaysInput = document.getElementById("duration-days") as HTMLInputElement;
  const durationHoursInput = document.getElementById("duration-hours") as HTMLInputElement;
  const durationMinutesInput = document.getElementById("duration-minutes") as HTMLInputElement;
  const kilometersInput = document.getElementById(
    "kilometers"
  ) as HTMLInputElement;
  const carTypeContainer = document.getElementById(
    "car-type"
  ) as HTMLDivElement;
  const transmissionContainer = document.getElementById(
    "transmission"
  ) as HTMLDivElement;
  const fuelTypeContainer = document.getElementById(
    "fuel-type"
  ) as HTMLDivElement;
  const resultsContainer = document.getElementById(
    "results-container"
  ) as HTMLDivElement;
  const filterToggle = document.getElementById(
    "filter-toggle"
  ) as HTMLButtonElement;
  const advancedFilters = document.getElementById(
    "advanced-filters"
  ) as HTMLDivElement;
  const sortSelect = document.getElementById("sort-by") as HTMLSelectElement;
  const loadingIndicator = document.getElementById(
    "loading-indicator"
  ) as HTMLDivElement;

  // Get all checkbox elements
  const carTypeCheckboxes = carTypeContainer.querySelectorAll(
    'input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>;
  const transmissionCheckboxes = transmissionContainer.querySelectorAll(
    'input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>;
  const fuelTypeCheckboxes = fuelTypeContainer.querySelectorAll(
    'input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>;

  // Helper function to set up filter checkbox logic
  function setupFilterCheckboxes(
    checkboxes: NodeListOf<HTMLInputElement>
  ): void {
    const allCheckbox = checkboxes[0]; // First checkbox is always 'All'

    // When 'All' is checked, uncheck others
    allCheckbox.addEventListener("change", function () {
      if (this.checked) {
        checkboxes.forEach((cb) => {
          if (cb !== allCheckbox) {
            cb.checked = false;
          }
        });
      } else {
        // If unchecking 'All' without selecting others, keep 'All' checked
        let anyOtherChecked = false;
        checkboxes.forEach((cb) => {
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
    checkboxes.forEach((cb) => {
      if (cb !== allCheckbox) {
        cb.addEventListener("change", function () {
          // When checking a specific option
          if (this.checked) {
            allCheckbox.checked = false;
          }

          // If no checkboxes are selected, re-check 'All'
          let anyChecked = false;
          checkboxes.forEach((innerCb) => {
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
  setupFilterCheckboxes(fuelTypeCheckboxes);

  // Initialize advanced filters toggle
  filterToggle.addEventListener("click", function () {
    this.classList.toggle("expanded");
    advancedFilters.classList.toggle("show");
    this.textContent = advancedFilters.classList.contains("show")
      ? "Hide options"
      : "Show more options";
  });

  // Initialize sort functionality
  sortSelect.addEventListener("change", function () {
    // Re-sort existing results without recalculating
    sortAndDisplayResults(currentResults);
  });

  // Store current results for sorting without recalculation
  let currentResults: PriceResultWithDetails[] = [];

  // Duration normalization function (for internal calculations only)
  function normalizeDurationForCalculation(): { days: number; hours: number; minutes: number } {
    const days = parseInt(durationDaysInput.value) || 0;
    const hours = parseInt(durationHoursInput.value) || 0;
    const minutes = parseInt(durationMinutesInput.value) || 0;

    // Convert everything to minutes for calculation
    let totalMinutes = days * 24 * 60 + hours * 60 + minutes;

    // Ensure minutes are in 15-minute increments for calculation
    totalMinutes = Math.round(totalMinutes / 15) * 15;

    // Convert back to days, hours, minutes
    const normalizedDays = Math.floor(totalMinutes / (24 * 60));
    const remainingMinutesAfterDays = totalMinutes % (24 * 60);
    const normalizedHours = Math.floor(remainingMinutesAfterDays / 60);
    const normalizedMinutes = remainingMinutesAfterDays % 60;

    return { days: normalizedDays, hours: normalizedHours, minutes: normalizedMinutes };
  }

  // Function to get total duration in hours
  function getTotalDurationInHours(): number {
    const days = parseInt(durationDaysInput.value) || 0;
    const hours = parseInt(durationHoursInput.value) || 0;
    const minutes = parseInt(durationMinutesInput.value) || 0;
    
    return days * 24 + hours + minutes / 60;
  }

  // Add input validation visual feedback
  function validateDurationInputs(): boolean {
    const days = parseInt(durationDaysInput.value) || 0;
    const hours = parseInt(durationHoursInput.value) || 0;
    const minutes = parseInt(durationMinutesInput.value) || 0;
    
    const totalHours = days * 24 + hours + minutes / 60;
    const maxHours = 31 * 24; // 31 days maximum
    
    const isValid = totalHours >= 0.25 && totalHours <= maxHours; // Minimum 15 minutes, maximum 31 days
    
    const durationGroup = document.querySelector('.duration-group');
    if (isValid) {
      durationGroup?.classList.remove('invalid');
    } else {
      durationGroup?.classList.add('invalid');
    }
    
    return isValid;
  }

  // Add input validation visual feedback
  function validateInput(input: HTMLInputElement): boolean {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;
    
    if (isNaN(value) || value < min || value > max) {
      input.classList.add("invalid");
      return false;
    } else {
      input.classList.remove("invalid");
      return true;
    }
  }

  // Add event listeners for input validation
  durationDaysInput.addEventListener("blur", function () {
    // Ensure days stay within limits
    const value = parseInt(this.value) || 0;
    if (value < 0) this.value = "0";
    if (value > 31) this.value = "7";
    validateDurationInputs();
  });

  durationHoursInput.addEventListener("blur", function () {
    // Ensure hours stay within limits
    const value = parseInt(this.value) || 0;
    if (value < 0) this.value = "0";
    if (value > 23) this.value = "23";
    validateDurationInputs();
  });

  durationMinutesInput.addEventListener("blur", function () {
    // Ensure minutes are in 15-minute increments and within limits
    const value = parseInt(this.value) || 0;
    const normalizedMinutes = Math.round(value / 15) * 15;
    if (normalizedMinutes < 0) this.value = "0";
    else if (normalizedMinutes > 45) this.value = "45";
    else this.value = normalizedMinutes.toString();
    validateDurationInputs();
  });

  kilometersInput.addEventListener("blur", function () {
    validateInput(this);
  });

  // Add event listeners for input changes to calculate prices automatically
  durationDaysInput.addEventListener("input", debounce(calculatePrices, 500));
  durationHoursInput.addEventListener("input", debounce(calculatePrices, 500));
  durationMinutesInput.addEventListener("input", debounce(calculatePrices, 500));
  kilometersInput.addEventListener("input", debounce(calculatePrices, 500));

  // Keep the form submission event listener for when users press Enter
  comparisonForm.addEventListener("submit", function (event) {
    event.preventDefault();
    calculatePrices();
  });

  // Simple debounce function to prevent excessive calculations while typing
  function debounce(func: Function, delay: number): (...args: any[]) => void {
    let timeout: number | undefined;
    return function (this: any) {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(context, args), delay);
    };
  }

  /**
   * Helper function to get selected values from checkboxes
   */
  function getSelectedCheckboxValues(
    checkboxes: NodeListOf<HTMLInputElement>
  ): string[] {
    const values: string[] = [];
    checkboxes.forEach((cb) => {
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
    loadingIndicator.classList.add("show");
    resultsContainer.innerHTML = "";

    // Get user input values
    const duration = getTotalDurationInHours();
    const kilometers = parseFloat(kilometersInput.value);
    const selectedCarTypes = getSelectedCheckboxValues(carTypeCheckboxes);
    const selectedTransmissions = getSelectedCheckboxValues(transmissionCheckboxes);
    const selectedFuelTypes = getSelectedCheckboxValues(fuelTypeCheckboxes);

    // Validate inputs
    const isDurationValid = validateDurationInputs();
    const isKilometersValid = validateInput(kilometersInput);
    if (!isDurationValid || !isKilometersValid) {
      loadingIndicator.classList.remove("show");
      return; // Don't calculate if inputs are invalid
    }

    // Enforce minimum booking duration of 1 hour
    const effectiveDuration = Math.max(1, duration);

    // If the user entered less than 1 hour, prepare a message
    let minDurationMessage: HTMLDivElement | null = null;
    if (duration < 1) {
      minDurationMessage = document.createElement("div");
      minDurationMessage.className = "min-duration-notice";
      minDurationMessage.innerHTML =
        "<strong>Note:</strong> All providers require a minimum booking of 1 hour. Prices shown are for 1 hour rentals.";
    }

    // Filter cars based on selected car types and transmissions
    let filteredCars = cars.slice();

    // Apply car type filter (if 'all' is selected, don't filter)
    if (!selectedCarTypes.includes("all")) {
      filteredCars = filteredCars.filter((car) =>
        selectedCarTypes.includes(car.type)
      );
    }

    // Apply transmission filter (if 'all' is selected, don't filter)
    if (!selectedTransmissions.includes("all")) {
      filteredCars = filteredCars.filter((car) =>
        selectedTransmissions.includes(car.transmission)
      );
    }

    // Apply fuel-type filter (if 'all' is selected, don't filter)
    if (!selectedFuelTypes.includes("all")) {
      filteredCars = filteredCars.filter((car) =>
        selectedFuelTypes.includes(car.fuelType)
      );
    }

    // Calculate prices for each car
    currentResults = filteredCars.map((car) => {
      const company = companies.find((company) => company.id === car.company)!;
      const priceData = CarShareCalculator.calculateCarPrice(
        car,
        company,
        effectiveDuration,
        kilometers
      );

      return {
        car: car,
        company: company,
        ...priceData,
      };
    });

    // Sort and display results
    sortAndDisplayResults(currentResults, minDurationMessage);
  }

  /**
   * Sort and display results based on current sort selection
   */
  function sortAndDisplayResults(
    results: PriceResultWithDetails[],
    minDurationMessage: HTMLDivElement | null = null
  ): void {
    // Sort results based on selected sort criteria
    const sortBy = sortSelect.value;

    switch (sortBy) {
      case "price":
        results.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case "price-desc":
        results.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case "company":
        results.sort((a, b) => a.company.name.localeCompare(b.company.name));
        break;
      case "car-type":
        results.sort((a, b) => {
          // First sort by car type
          const typeComparison = a.car.type.localeCompare(b.car.type);
          // If same type, sort by price
          return typeComparison !== 0
            ? typeComparison
            : a.totalPrice - b.totalPrice;
        });
        break;
    }

    // Clear previous results
    resultsContainer.innerHTML = "";

    // Add minimum duration message if provided
    if (minDurationMessage) {
      resultsContainer.appendChild(minDurationMessage);
    }

    // Find the best deal (lowest price) to highlight
    let bestDealPrice = Infinity;
    if (results.length > 0) {
      bestDealPrice = Math.min(...results.map((r) => r.totalPrice));
    }

    // Display results
    results.forEach((result) => {
      displayCarResult(result, result.totalPrice === bestDealPrice);
    });

    // Show message if no cars match the filters
    if (results.length === 0) {
      const noResultsMessage = document.createElement("div");
      noResultsMessage.className = "no-results";
      noResultsMessage.textContent =
        "No cars match the selected filters. Please try different filter options.";
      resultsContainer.appendChild(noResultsMessage);
    }

    // Hide loading indicator
    loadingIndicator.classList.remove("show");
  }

  /**
   * Display car price result in the UI
   */
  function displayCarResult(
    result: PriceResultWithDetails,
    isBestDeal: boolean = false
  ): void {
    const {
      car,
      company,
      timeCost,
      distanceCost,
      totalPrice,
      paidKm,
      freeKm,
      pricePerExtraKm,
      pricingTier,
    } = result;

    // Create result card element
    const cardElement = document.createElement("div");
    cardElement.className = "car-card";

    // Mark as best deal if applicable
    if (isBestDeal) {
      cardElement.classList.add("best-deal");
      // Add 'Best Deal' ribbon
      const bestDealTag = document.createElement("div");
      bestDealTag.className = "best-deal-tag";
      bestDealTag.textContent = "BEST DEAL";
      cardElement.appendChild(bestDealTag);
    }

    // Format currency
    const formatCurrency = (value: number): string => {
      return "€" + value.toFixed(2);
    };

    // Create free km display message
    let freeKmMessage = `${freeKm} km`;

    // Populate card with car details and prices
    cardElement.innerHTML = `
            <div class="company">
                <div class="company-logo"><img src="images/${company.logo}" role="presentation" /></div>
                ${company.name}
            </div>
            <h1 class="car-name">
                ${car.name}
                <span class="icons">
                    ${
                        car.transmission == "manual"
                        ? "<svg  xmlns='http://www.w3.org/2000/svg'  width='24'  height='24'  viewBox='0 0 24 24'  fill='currentColor'><title>Manual transmission</title><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M19 3a3 3 0 0 1 1 5.829v1.171a3 3 0 0 1 -3 3h-4v2.171a3.001 3.001 0 1 1 -4 2.829l.005 -.176a3 3 0 0 1 1.995 -2.654v-2.17h-5v2.171a3.001 3.001 0 1 1 -4 2.829l.005 -.176a3 3 0 0 1 1.995 -2.654v-6.341a3 3 0 0 1 -2 -2.829l.005 -.176a3 3 0 1 1 3.996 3.005l-.001 2.171h5v-2.17a3 3 0 0 1 -2 -2.83l.005 -.176a3 3 0 1 1 3.996 3.005l-.001 2.171h4a1 1 0 0 0 1 -1v-1.17a3 3 0 0 1 -2 -2.83l.005 -.176a3 3 0 0 1 2.995 -2.824' /></svg>"
                        : "<svg  xmlns='http://www.w3.org/2000/svg'  width='24'  height='24'  viewBox='0 0 24 24'  fill='currentColor'><title>Automatic transmission</title><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12.707 2.793l2.208 2.207h3.085a1 1 0 0 1 .993 .883l.007 .117v3.085l2.207 2.208a1 1 0 0 1 .083 1.32l-.083 .094l-2.207 2.207v3.086a1 1 0 0 1 -.883 .993l-.117 .007h-3.086l-2.207 2.207a1 1 0 0 1 -1.32 .083l-.094 -.083l-2.208 -2.207h-3.085a1 1 0 0 1 -.993 -.883l-.007 -.117v-3.085l-2.207 -2.208a1 1 0 0 1 -.083 -1.32l.083 -.094l2.207 -2.209v-3.084a1 1 0 0 1 .883 -.993l.117 -.007h3.084l2.209 -2.207a1 1 0 0 1 1.414 0m-.707 5.207a3 3 0 0 0 -3 3v3.5a1 1 0 0 0 2 0v-.5h2v.5a1 1 0 0 0 .883 .993l.117 .007a1 1 0 0 0 1 -1v-3.5a3 3 0 0 0 -3 -3m0 2a1 1 0 0 1 1 1v1h-2v-1a1 1 0 0 1 .883 -.993z' /></svg>"
                    }
                    ${
                        car.fuelType == "electric"
                        ? "<svg  xmlns='http://www.w3.org/2000/svg'  width='24'  height='24'  viewBox='0 0 24 24'  fill='currentColor'><title>Electric transmission</title><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M13 2l.018 .001l.016 .001l.083 .005l.011 .002h.011l.038 .009l.052 .008l.016 .006l.011 .001l.029 .011l.052 .014l.019 .009l.015 .004l.028 .014l.04 .017l.021 .012l.022 .01l.023 .015l.031 .017l.034 .024l.018 .011l.013 .012l.024 .017l.038 .034l.022 .017l.008 .01l.014 .012l.036 .041l.026 .027l.006 .009c.12 .147 .196 .322 .218 .513l.001 .012l.002 .041l.004 .064v6h5a1 1 0 0 1 .868 1.497l-.06 .091l-8 11c-.568 .783 -1.808 .38 -1.808 -.588v-6h-5a1 1 0 0 1 -.868 -1.497l.06 -.091l8 -11l.01 -.013l.018 -.024l.033 -.038l.018 -.022l.009 -.008l.013 -.014l.04 -.036l.028 -.026l.008 -.006a1 1 0 0 1 .402 -.199l.011 -.001l.027 -.005l.074 -.013l.011 -.001l.041 -.002z' /></svg>"
                        : ""
                    }
                </span>
            </h1>
           <!-- ${car.notes ? `<h2 class="car-notes">${car.notes}</h2>` : ""} --->
            <div class="details">
                <div>${CarShareCalculator.capitalizeFirstLetter(car.type)}</div>
            </div>
            <div class="price">${formatCurrency(totalPrice)}</div>
            <div class="breakdown">
                <div>Time cost: ${pricingTier} (${formatCurrency(timeCost)})</div>
                <div>Distance cost: ${freeKmMessage} free + ${paidKm} additional kilometers (${formatCurrency(distanceCost)})</div>
            </div>
        `;

    // Add card to results container
    resultsContainer.appendChild(cardElement);
  }

  /**
   * Check for URL parameters and pre-fill form if found
   */
  function loadFromUrlParams(): void {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("duration")) {
      const totalHours = parseFloat(urlParams.get("duration")!);
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      const minutes = Math.round((totalHours % 1) * 60);
      
      durationDaysInput.value = days.toString();
      durationHoursInput.value = hours.toString();
      durationMinutesInput.value = minutes.toString();
    }

    if (urlParams.has("km")) {
      kilometersInput.value = urlParams.get("km")!;
    }

    if (urlParams.has("carType")) {
      const carTypes = urlParams.get("carType")!.split(",");

      // Uncheck "All" and check the specific car types
      const allCheckbox = document.getElementById(
        "car-type-all"
      ) as HTMLInputElement;
      if (allCheckbox) {
        allCheckbox.checked = false;
      }

      carTypes.forEach((carType) => {
        const specificCheckbox = document.getElementById(
          `car-type-${carType}`
        ) as HTMLInputElement;
        if (specificCheckbox) {
          specificCheckbox.checked = true;
        }
      });

      // Ensure advanced filters are shown if a filter is applied
      advancedFilters.classList.add("show");
      filterToggle.classList.add("expanded");
      filterToggle.textContent = "Hide Options";
    }

    if (urlParams.has("transmission")) {
      const transmissions = urlParams.get("transmission")!.split(",");

      // Uncheck "All" and check the specific transmissions
      const allCheckbox = document.getElementById(
        "transmission-all"
      ) as HTMLInputElement;
      if (allCheckbox) {
        allCheckbox.checked = false;
      }

      transmissions.forEach((transmission) => {
        const specificCheckbox = document.getElementById(
          `transmission-${transmission}`
        ) as HTMLInputElement;
        if (specificCheckbox) {
          specificCheckbox.checked = true;
        }
      });

      // Ensure advanced filters are shown if a filter is applied
      advancedFilters.classList.add("show");
      filterToggle.classList.add("expanded");
      filterToggle.textContent = "Hide Options";
    }
  }

  // Load from URL parameters if any
  loadFromUrlParams();

  // Calculate prices on initial load with default values
  calculatePrices();
});
