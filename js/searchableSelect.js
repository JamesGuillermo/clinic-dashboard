/**
 * Searchable Multiselect Component
 * Provides Streamlit-like searchable dropdown filters
 */

const SearchableSelect = {
    instances: {},

    /**
     * Create a searchable multiselect
     * @param {string} containerId - Container element ID
     * @param {Object} options - Configuration options
     */
    create: function (containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = {
            placeholder: options.placeholder || 'Choose options',
            values: options.values || [],
            onChange: options.onChange || (() => { }),
            maxDisplay: options.maxDisplay || 3
        };

        // Store instance
        this.instances[containerId] = {
            config,
            selected: [],
            isOpen: false
        };

        // Create the component HTML
        container.innerHTML = `
            <div class="ss-wrapper" data-id="${containerId}">
                <div class="ss-control">
                    <div class="ss-selected-items"></div>
                    <input type="text" class="ss-search" placeholder="${config.placeholder}">
                    <button type="button" class="ss-clear hidden" title="Clear all">×</button>
                    <button type="button" class="ss-toggle" title="Toggle dropdown">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="ss-dropdown hidden">
                    <div class="ss-options"></div>
                </div>
            </div>
        `;

        // Populate options
        this.populateOptions(containerId, config.values);

        // Attach event listeners
        this.attachEvents(containerId);
    },

    /**
     * Populate dropdown options
     * @param {string} containerId - Container ID
     * @param {Array} values - Array of values
     */
    populateOptions: function (containerId, values) {
        const instance = this.instances[containerId];
        if (!instance) return;

        instance.config.values = values;

        const container = document.getElementById(containerId);
        const optionsDiv = container.querySelector('.ss-options');

        optionsDiv.innerHTML = '';
        values.forEach(value => {
            const option = document.createElement('div');
            option.className = 'ss-option';
            option.dataset.value = value;
            option.textContent = value;
            option.title = value;
            optionsDiv.appendChild(option);
        });
    },

    /**
     * Attach event listeners
     * @param {string} containerId - Container ID
     */
    attachEvents: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        const wrapper = container.querySelector('.ss-wrapper');
        const control = container.querySelector('.ss-control');
        const search = container.querySelector('.ss-search');
        const dropdown = container.querySelector('.ss-dropdown');
        const clearBtn = container.querySelector('.ss-clear');
        const toggleBtn = container.querySelector('.ss-toggle');
        const optionsDiv = container.querySelector('.ss-options');

        // Toggle dropdown on control click
        control.addEventListener('click', (e) => {
            if (e.target !== clearBtn && !clearBtn.contains(e.target)) {
                this.toggleDropdown(containerId);
                search.focus();
            }
        });

        // Search input
        search.addEventListener('input', (e) => {
            this.filterOptions(containerId, e.target.value);
        });

        search.addEventListener('focus', () => {
            this.openDropdown(containerId);
        });

        // Option click
        optionsDiv.addEventListener('click', (e) => {
            const option = e.target.closest('.ss-option');
            if (option) {
                this.toggleOption(containerId, option.dataset.value);
            }
        });

        // Clear button
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearAll(containerId);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                this.closeDropdown(containerId);
            }
        });

        // Keyboard navigation
        search.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown(containerId);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const visible = optionsDiv.querySelectorAll('.ss-option:not(.hidden)');
                if (visible.length > 0) {
                    this.toggleOption(containerId, visible[0].dataset.value);
                }
            }
        });
    },

    /**
     * Toggle dropdown visibility
     * @param {string} containerId - Container ID
     */
    toggleDropdown: function (containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;

        if (instance.isOpen) {
            this.closeDropdown(containerId);
        } else {
            this.openDropdown(containerId);
        }
    },

    /**
     * Open dropdown
     * @param {string} containerId - Container ID
     */
    openDropdown: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        const dropdown = container.querySelector('.ss-dropdown');
        dropdown.classList.remove('hidden');
        instance.isOpen = true;

        // Reset filter
        this.filterOptions(containerId, '');
    },

    /**
     * Close dropdown
     * @param {string} containerId - Container ID
     */
    closeDropdown: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        const dropdown = container.querySelector('.ss-dropdown');
        const search = container.querySelector('.ss-search');
        dropdown.classList.add('hidden');
        instance.isOpen = false;
        search.value = '';
        this.filterOptions(containerId, '');
    },

    /**
     * Filter options based on search
     * @param {string} containerId - Container ID
     * @param {string} query - Search query
     */
    filterOptions: function (containerId, query) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const options = container.querySelectorAll('.ss-option');
        const lowerQuery = query.toLowerCase();

        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (query === '' || text.includes(lowerQuery)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    },

    /**
     * Toggle option selection
     * @param {string} containerId - Container ID
     * @param {string} value - Option value
     */
    toggleOption: function (containerId, value) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        const option = container.querySelector(`.ss-option[data-value="${CSS.escape(value)}"]`);
        if (!option) return;

        const index = instance.selected.indexOf(value);
        if (index > -1) {
            instance.selected.splice(index, 1);
            option.classList.remove('selected');
        } else {
            instance.selected.push(value);
            option.classList.add('selected');
        }

        this.updateDisplay(containerId);
        instance.config.onChange(instance.selected);
    },

    /**
     * Clear all selections
     * @param {string} containerId - Container ID
     */
    clearAll: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        instance.selected = [];
        container.querySelectorAll('.ss-option.selected').forEach(opt => {
            opt.classList.remove('selected');
        });

        this.updateDisplay(containerId);
        instance.config.onChange(instance.selected);
    },

    /**
     * Update the display of selected items
     * @param {string} containerId - Container ID
     */
    updateDisplay: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        const selectedDiv = container.querySelector('.ss-selected-items');
        const search = container.querySelector('.ss-search');
        const clearBtn = container.querySelector('.ss-clear');

        if (instance.selected.length === 0) {
            selectedDiv.innerHTML = '';
            search.placeholder = instance.config.placeholder;
            clearBtn.classList.add('hidden');
        } else {
            search.placeholder = '';
            clearBtn.classList.remove('hidden');

            // Show selected tags
            const maxDisplay = instance.config.maxDisplay;
            let html = '';

            instance.selected.slice(0, maxDisplay).forEach(val => {
                const displayVal = val.length > 15 ? val.substring(0, 15) + '...' : val;
                html += `<span class="ss-tag" title="${val}">${displayVal}</span>`;
            });

            if (instance.selected.length > maxDisplay) {
                html += `<span class="ss-tag ss-tag-more">+${instance.selected.length - maxDisplay} more</span>`;
            }

            selectedDiv.innerHTML = html;
        }
    },

    /**
     * Get selected values
     * @param {string} containerId - Container ID
     * @returns {Array} Selected values
     */
    getSelected: function (containerId) {
        const instance = this.instances[containerId];
        return instance ? instance.selected : [];
    },

    /**
     * Set selected values
     * @param {string} containerId - Container ID
     * @param {Array} values - Values to select
     */
    setSelected: function (containerId, values) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        // Clear current selections
        container.querySelectorAll('.ss-option.selected').forEach(opt => {
            opt.classList.remove('selected');
        });

        instance.selected = values;

        // Mark as selected
        values.forEach(val => {
            const option = container.querySelector(`.ss-option[data-value="${CSS.escape(val)}"]`);
            if (option) {
                option.classList.add('selected');
            }
        });

        this.updateDisplay(containerId);
    },

    /**
     * Clear selections without triggering callback
     * @param {string} containerId - Container ID
     */
    reset: function (containerId) {
        const container = document.getElementById(containerId);
        const instance = this.instances[containerId];
        if (!container || !instance) return;

        instance.selected = [];
        container.querySelectorAll('.ss-option.selected').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.updateDisplay(containerId);
    }
};
