/**
 * Main Application Module
 * Orchestrates all components
 */

const App = {
    // Store full dataset
    fullData: [],
    filteredData: [],

    /**
     * Initialize the application
     */
    init: function () {
        console.log('Clinic Dashboard initialized');

        // Setup file upload
        this.setupFileUpload();

        // Setup tab navigation
        this.setupTabs();

        // Setup mobile menu
        this.setupMobileMenu();

        // Setup filter event listeners
        Filters.setupEventListeners(() => this.onFilterChange());

        // Setup export buttons
        Export.setupEventListeners(() => this.filteredData);
    },

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu: function () {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!menuToggle || !sidebar) return;

        // Toggle menu on button click
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            sidebar.classList.toggle('open');
            overlay?.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when overlay is clicked
        overlay?.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu on window resize (if going to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                menuToggle.classList.remove('active');
                sidebar.classList.remove('open');
                overlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu when a filter is selected on mobile
        sidebar.addEventListener('click', (e) => {
            if (e.target.classList.contains('ss-option') && window.innerWidth <= 768) {
                // Keep menu open after selection - better UX
            }
        });
    },

    /**
     * Setup file upload handler
     */
    setupFileUpload: function () {
        const fileInput = document.getElementById('fileInput');
        const fileLabel = document.getElementById('fileLabel');
        const fileStatus = document.getElementById('fileStatus');

        if (!fileInput) return;

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Update label
            if (fileLabel) fileLabel.textContent = file.name;
            if (fileStatus) {
                fileStatus.textContent = 'Loading...';
                fileStatus.className = 'file-status loading';
            }

            try {
                // Parse file
                const data = await DataLoader.parseFile(file);

                // Validate columns
                const validation = DataLoader.validateColumns(data);
                if (!validation.valid) {
                    console.warn(validation.message);
                }

                // Store data
                this.fullData = data;
                this.filteredData = data;

                // Update status
                if (fileStatus) {
                    fileStatus.textContent = `✅ Loaded ${data.length.toLocaleString()} records`;
                    fileStatus.className = 'file-status success';
                }

                // Populate filters
                Filters.populateFilters(data);

                // Show dashboard
                this.showDashboard();

                // Render everything
                this.refresh();

            } catch (error) {
                console.error('Error loading file:', error);
                if (fileStatus) {
                    fileStatus.textContent = `❌ Error: ${error.message}`;
                    fileStatus.className = 'file-status error';
                }
            }
        });
    },

    /**
     * Setup tab navigation
     */
    setupTabs: function () {
        document.querySelectorAll('.tabs').forEach(tabContainer => {
            const buttons = tabContainer.querySelectorAll('.tab-btn');
            const panels = tabContainer.nextElementSibling?.querySelectorAll('.tab-panel');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all buttons and panels
                    buttons.forEach(b => b.classList.remove('active'));
                    panels?.forEach(p => p.classList.remove('active'));

                    // Add active to clicked button and corresponding panel
                    btn.classList.add('active');
                    const targetId = btn.dataset.tab;
                    const targetPanel = document.getElementById(targetId);
                    if (targetPanel) targetPanel.classList.add('active');
                });
            });
        });
    },

    /**
     * Show dashboard content, hide welcome message
     */
    showDashboard: function () {
        const welcome = document.getElementById('welcomeMessage');
        const dashboard = document.getElementById('dashboardContent');

        if (welcome) welcome.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
    },

    /**
     * Handle filter change
     */
    onFilterChange: function () {
        if (this.fullData.length === 0) return;

        // Apply filters
        this.filteredData = Filters.applyFilters(this.fullData);

        // Refresh view
        this.refresh();
    },

    /**
     * Refresh all dashboard components
     */
    refresh: function () {
        const data = this.filteredData;
        const topN = Filters.getTopN();

        // Update header
        this.updateHeader(data);

        // Update metrics
        this.updateMetrics(data);

        // Render charts
        Charts.renderAll(data, topN);

        // Update data table
        this.updateDataTable(data);
    },

    /**
     * Update header caption
     * @param {Array} data - Filtered data
     */
    updateHeader: function (data) {
        const caption = document.getElementById('headerCaption');
        if (!caption) return;

        const uniquePatients = DataProcessor.getUniquePatients(data);
        const now = new Date().toLocaleString();
        caption.textContent = `Last updated: ${now} | Showing ${data.length.toLocaleString()} records from ${uniquePatients.toLocaleString()} unique patients`;
    },

    /**
     * Update all metric cards
     * @param {Array} data - Filtered data
     */
    updateMetrics: function (data) {
        const uniquePatients = DataProcessor.getUniquePatients(data);
        const avgFindings = uniquePatients > 0 ? (data.length / uniquePatients).toFixed(1) : '0';
        const avgAge = DataProcessor.getAverageAge(data);

        // Key metrics
        this.setMetric('metricPatients', uniquePatients.toLocaleString());
        this.setMetric('metricRecords', data.length.toLocaleString());
        this.setMetric('metricAvgFindings', avgFindings);
        this.setMetric('metricCompanies', DataProcessor.getUniqueCount(data, COLUMNS.COMPANY).toLocaleString());
        this.setMetric('metricICD', DataProcessor.getUniqueCount(data, COLUMNS.ICD).toLocaleString());
        this.setMetric('metricAvgAge', avgAge.toFixed(1) + ' yrs');

        // Clinical findings metrics
        this.setMetric('metricUniqueFindings', DataProcessor.getUniqueCount(data, COLUMNS.FINDINGS).toLocaleString());

        // Top finding
        const topFindings = DataProcessor.getTopFindings(data, 1);
        if (topFindings.length > 0) {
            this.setMetric('metricTopFinding', this.truncate(topFindings[0].finding, 25));
            this.setMetric('metricTopFindingCount', `${topFindings[0].count.toLocaleString()} occurrences`);
        }

        // Peak month finding
        const peakMonth = DataProcessor.getPeakMonthFinding(data);
        this.setMetric('metricPeakMonthFinding', this.truncate(peakMonth.topFinding, 22));
        this.setMetric('metricPeakMonth', `in ${peakMonth.monthName}`);

        // Largest age bracket finding
        const ageBracket = DataProcessor.getLargestAgeBracketFinding(data);
        this.setMetric('metricAgeGroupFinding', this.truncate(ageBracket.topFinding, 22));
        this.setMetric('metricLargestAge', `Age ${ageBracket.bracket}`);
    },

    /**
     * Set metric value
     * @param {string} id - Element ID
     * @param {string} value - Value to display
     */
    setMetric: function (id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    /**
     * Update data table preview
     * @param {Array} data - Filtered data
     */
    updateDataTable: function (data) {
        const thead = document.getElementById('dataTableHead');
        const tbody = document.getElementById('dataTableBody');

        if (!thead || !tbody) return;

        // Clear existing
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (data.length === 0) return;

        // Get columns
        const columns = Object.values(COLUMNS);
        const availableColumns = columns.filter(col => data[0].hasOwnProperty(col));

        // Create header
        const headerRow = document.createElement('tr');
        availableColumns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create rows (limit to 100)
        const displayData = data.slice(0, 100);
        displayData.forEach(row => {
            const tr = document.createElement('tr');
            availableColumns.forEach(col => {
                const td = document.createElement('td');
                let value = row[col];

                // Format dates
                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                }

                // Truncate long text
                if (typeof value === 'string' && value.length > 50) {
                    value = value.substring(0, 50) + '...';
                }

                td.textContent = value ?? '';
                td.title = row[col] ?? '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Max length
     * @returns {string}
     */
    truncate: function (text, maxLength) {
        if (!text) return 'N/A';
        text = String(text);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
