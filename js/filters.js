/**
 * Filters Module
 * Handles filter population and application
 */

const Filters = {
    // Store current filter values
    state: {
        companies: [],
        purposes: [],
        months: [],
        sexes: [],
        labels: [],
        findings: [],
        dateStart: null,
        dateEnd: null,
        ageMin: 0,
        ageMax: 100
    },

    // Store original min/max values for reset
    originalRanges: {
        dateMin: null,
        dateMax: null,
        ageMin: 0,
        ageMax: 100
    },

    // Month ordering for calendar sequence
    monthOrder: [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ],

    // Callback reference
    onFilterChange: null,

    /**
     * Populate all filter dropdowns with unique values from data
     * @param {Array} data - Full dataset
     */
    populateFilters: function (data) {
        const self = this;
        const callback = () => {
            if (self.onFilterChange) self.onFilterChange();
        };

        // Company filter
        SearchableSelect.create('companyFilter', {
            placeholder: 'Choose companies',
            values: this.getUniqueValues(data, COLUMNS.COMPANY),
            onChange: callback
        });

        // Purpose filter
        SearchableSelect.create('purposeFilter', {
            placeholder: 'Choose purposes',
            values: this.getUniqueValues(data, COLUMNS.PURPOSE),
            onChange: callback
        });

        // Month filter - sorted by calendar order
        const months = this.getUniqueValues(data, COLUMNS.MONTH);
        const sortedMonths = months.sort((a, b) => {
            const indexA = this.monthOrder.indexOf(a.toUpperCase());
            const indexB = this.monthOrder.indexOf(b.toUpperCase());
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        SearchableSelect.create('monthFilter', {
            placeholder: 'Choose months',
            values: sortedMonths,
            onChange: callback
        });

        // Sex filter
        SearchableSelect.create('sexFilter', {
            placeholder: 'Choose sex',
            values: this.getUniqueValues(data, COLUMNS.SEX),
            onChange: callback
        });

        // Label filter
        SearchableSelect.create('labelFilter', {
            placeholder: 'Choose labels',
            values: this.getUniqueValues(data, COLUMNS.LABEL),
            onChange: callback
        });

        // Clinical Findings filter
        SearchableSelect.create('findingsFilter', {
            placeholder: 'Choose findings',
            values: this.getUniqueValues(data, COLUMNS.FINDINGS),
            onChange: callback
        });

        // Date range
        this.populateDateRange(data);

        // Age range
        this.populateAgeRange(data);
    },

    /**
     * Get unique values for a column
     * @param {Array} data - Data array
     * @param {string} column - Column name
     * @returns {Array} - Sorted unique values
     */
    getUniqueValues: function (data, column) {
        const values = new Set();
        data.forEach(row => {
            const val = row[column];
            if (val !== null && val !== undefined && val !== '') {
                values.add(String(val));
            }
        });
        return Array.from(values).sort();
    },

    /**
     * Populate a select element with options
     * @param {string} selectId - Select element ID
     * @param {Array} values - Array of values
     */
    populateSelect: function (selectId, values) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value.length > 40 ? value.substring(0, 40) + '...' : value;
            option.title = value;
            select.appendChild(option);
        });
    },

    /**
     * Populate date range inputs
     * @param {Array} data - Data array
     */
    populateDateRange: function (data) {
        const dates = data
            .map(row => row[COLUMNS.DATE])
            .filter(d => d instanceof Date && !isNaN(d.getTime()))
            .sort((a, b) => a - b);

        if (dates.length === 0) return;

        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];

        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');

        if (dateStart && dateEnd) {
            // Use local date format to avoid timezone issues
            const formatDate = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const minDateStr = formatDate(minDate);
            const maxDateStr = formatDate(maxDate);

            dateStart.value = minDateStr;
            dateEnd.value = maxDateStr;
            dateStart.min = minDateStr;
            dateStart.max = maxDateStr;
            dateEnd.min = minDateStr;
            dateEnd.max = maxDateStr;

            // Store original range for reset
            this.originalRanges.dateMin = minDateStr;
            this.originalRanges.dateMax = maxDateStr;

            this.state.dateStart = minDate;
            this.state.dateEnd = maxDate;
        }
    },

    /**
     * Populate age range slider
     * @param {Array} data - Data array
     */
    populateAgeRange: function (data) {
        const ages = data
            .map(row => row[COLUMNS.AGE])
            .filter(a => a !== null && !isNaN(a));

        if (ages.length === 0) return;

        const minAge = Math.floor(Math.min(...ages));
        const maxAge = Math.ceil(Math.max(...ages));

        const ageMinSlider = document.getElementById('ageMin');
        const ageMaxSlider = document.getElementById('ageMax');
        const ageLabel = document.getElementById('ageRangeLabel');

        if (ageMinSlider && ageMaxSlider) {
            ageMinSlider.min = minAge;
            ageMinSlider.max = maxAge;
            ageMinSlider.value = minAge;

            ageMaxSlider.min = minAge;
            ageMaxSlider.max = maxAge;
            ageMaxSlider.value = maxAge;

            // Store original range for reset
            this.originalRanges.ageMin = minAge;
            this.originalRanges.ageMax = maxAge;

            this.state.ageMin = minAge;
            this.state.ageMax = maxAge;

            if (ageLabel) {
                ageLabel.textContent = `${minAge} - ${maxAge}`;
            }
        }
    },

    /**
     * Get selected values from a searchable select
     * @param {string} selectId - Select element ID
     * @returns {Array} - Selected values
     */
    getSelectedValues: function (selectId) {
        return SearchableSelect.getSelected(selectId);
    },

    /**
     * Read all current filter values from UI
     */
    readFilterState: function () {
        this.state.companies = this.getSelectedValues('companyFilter');
        this.state.purposes = this.getSelectedValues('purposeFilter');
        this.state.months = this.getSelectedValues('monthFilter');
        this.state.sexes = this.getSelectedValues('sexFilter');
        this.state.labels = this.getSelectedValues('labelFilter');
        this.state.findings = this.getSelectedValues('findingsFilter');

        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');

        // Parse dates as local time (not UTC) to avoid timezone issues
        // HTML date input gives YYYY-MM-DD format
        if (dateStart && dateStart.value) {
            const [year, month, day] = dateStart.value.split('-').map(Number);
            this.state.dateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
        } else {
            this.state.dateStart = null;
        }

        if (dateEnd && dateEnd.value) {
            const [year, month, day] = dateEnd.value.split('-').map(Number);
            this.state.dateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
        } else {
            this.state.dateEnd = null;
        }

        const ageMin = document.getElementById('ageMin');
        const ageMax = document.getElementById('ageMax');
        this.state.ageMin = ageMin ? parseInt(ageMin.value) : 0;
        this.state.ageMax = ageMax ? parseInt(ageMax.value) : 100;
    },

    /**
     * Apply all filters to data
     * @param {Array} data - Full dataset
     * @returns {Array} - Filtered dataset
     */
    applyFilters: function (data) {
        this.readFilterState();

        return data.filter(row => {
            // Company filter
            if (this.state.companies.length > 0) {
                if (!this.state.companies.includes(String(row[COLUMNS.COMPANY]))) return false;
            }

            // Purpose filter
            if (this.state.purposes.length > 0) {
                if (!this.state.purposes.includes(String(row[COLUMNS.PURPOSE]))) return false;
            }

            // Month filter
            if (this.state.months.length > 0) {
                if (!this.state.months.includes(String(row[COLUMNS.MONTH]))) return false;
            }

            // Sex filter
            if (this.state.sexes.length > 0) {
                if (!this.state.sexes.includes(String(row[COLUMNS.SEX]))) return false;
            }

            // Label filter
            if (this.state.labels.length > 0) {
                if (!this.state.labels.includes(String(row[COLUMNS.LABEL]))) return false;
            }

            // Clinical Findings filter
            if (this.state.findings.length > 0) {
                if (!this.state.findings.includes(String(row[COLUMNS.FINDINGS]))) return false;
            }

            // Date range filter
            if (this.state.dateStart && this.state.dateEnd) {
                const rowDate = row[COLUMNS.DATE];
                if (rowDate instanceof Date) {
                    if (rowDate < this.state.dateStart || rowDate > this.state.dateEnd) return false;
                }
            }

            // Age range filter
            const age = row[COLUMNS.AGE];
            if (age !== null && age !== undefined && !isNaN(age)) {
                if (age < this.state.ageMin || age > this.state.ageMax) return false;
            }

            return true;
        });
    },

    /**
     * Clear all filters
     */
    clearFilters: function () {
        // Clear searchable selects
        ['companyFilter', 'purposeFilter', 'monthFilter', 'sexFilter', 'labelFilter', 'findingsFilter'].forEach(id => {
            SearchableSelect.reset(id);
        });

        // Reset date range to original values
        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');
        if (dateStart && this.originalRanges.dateMin) {
            dateStart.value = this.originalRanges.dateMin;
        }
        if (dateEnd && this.originalRanges.dateMax) {
            dateEnd.value = this.originalRanges.dateMax;
        }

        // Reset age range to original values
        const ageMin = document.getElementById('ageMin');
        const ageMax = document.getElementById('ageMax');
        if (ageMin) ageMin.value = this.originalRanges.ageMin;
        if (ageMax) ageMax.value = this.originalRanges.ageMax;

        const ageLabel = document.getElementById('ageRangeLabel');
        if (ageLabel) {
            ageLabel.textContent = `${this.originalRanges.ageMin} - ${this.originalRanges.ageMax}`;
        }
    },

    /**
     * Setup filter event listeners
     * @param {Function} onFilterChange - Callback when filters change
     */
    setupEventListeners: function (onFilterChange) {
        // Store callback for searchable selects
        this.onFilterChange = onFilterChange;

        // Date inputs
        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');
        if (dateStart) dateStart.addEventListener('change', onFilterChange);
        if (dateEnd) dateEnd.addEventListener('change', onFilterChange);

        // Age range sliders
        const ageMin = document.getElementById('ageMin');
        const ageMax = document.getElementById('ageMax');
        const ageLabel = document.getElementById('ageRangeLabel');

        const updateAgeLabel = () => {
            if (ageLabel && ageMin && ageMax) {
                ageLabel.textContent = `${ageMin.value} - ${ageMax.value}`;
            }
        };

        if (ageMin) {
            ageMin.addEventListener('input', updateAgeLabel);
            ageMin.addEventListener('change', onFilterChange);
        }
        if (ageMax) {
            ageMax.addEventListener('input', updateAgeLabel);
            ageMax.addEventListener('change', onFilterChange);
        }

        // Clear filters button
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
                onFilterChange();
            });
        }

        // Top N slider
        const topNSlider = document.getElementById('topNSlider');
        const topNLabel = document.getElementById('topNLabel');
        if (topNSlider) {
            topNSlider.addEventListener('input', () => {
                if (topNLabel) topNLabel.textContent = topNSlider.value;
            });
            topNSlider.addEventListener('change', onFilterChange);
        }
    },

    /**
     * Get current Top N value
     * @returns {number} - Top N value
     */
    getTopN: function () {
        const slider = document.getElementById('topNSlider');
        return slider ? parseInt(slider.value) : 15;
    }
};
