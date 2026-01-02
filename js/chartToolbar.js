/**
 * Chart Toolbar Module
 * Provides table view toggle, fullscreen, search, and download for charts
 */

const ChartToolbar = {
    // Store chart data for each chart ID
    chartData: {},

    /**
     * Initialize toolbar for a chart container
     * @param {string} chartId - Canvas element ID
     * @param {string} title - Chart title
     * @param {Array} data - Data array for table view
     * @param {Array} columns - Column definitions [{key, label}]
     */
    init: function (chartId, title, data, columns) {
        this.chartData[chartId] = { title, data, columns };

        // Find the canvas and its parent
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const parent = canvas.parentElement;

        // Check if toolbar already exists
        if (parent.querySelector('.chart-toolbar')) {
            // Just update the data
            return;
        }

        // Wrap canvas in a chart-wrapper if not already
        if (!parent.classList.contains('chart-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-wrapper';
            wrapper.innerHTML = `
                <div class="chart-toolbar">
                    <button class="toolbar-btn" data-action="table" data-chart="${chartId}" title="Show data">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="3" y1="15" x2="21" y2="15"></line>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                    </button>
                    <button class="toolbar-btn" data-action="fullscreen" data-chart="${chartId}" title="Fullscreen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                </div>
                <div class="chart-view active">
                    <!-- Canvas will be moved here -->
                </div>
                <div class="table-view">
                    <div class="table-toolbar">
                        <button class="toolbar-btn" data-action="chart" data-chart="${chartId}" title="Show chart">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="download" data-chart="${chartId}" title="Download CSV">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                        <button class="toolbar-btn" data-action="search" data-chart="${chartId}" title="Search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <input type="text" class="search-input hidden" data-chart="${chartId}" placeholder="Type to search...">
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            `;

            // Move canvas into chart-view
            const chartView = wrapper.querySelector('.chart-view');
            parent.insertBefore(wrapper, canvas);
            chartView.appendChild(canvas);
        }

        // Attach event listeners
        this.attachEventListeners(chartId);
    },

    /**
     * Update data for a chart
     * @param {string} chartId - Canvas element ID
     * @param {Array} data - New data array
     * @param {Array} columns - Column definitions
     */
    updateData: function (chartId, data, columns) {
        if (!this.chartData[chartId]) {
            this.chartData[chartId] = { title: '', data: [], columns: [] };
        }
        this.chartData[chartId].data = data;
        this.chartData[chartId].columns = columns;

        // Update table if it's visible
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (wrapper && wrapper.querySelector('.table-view.active')) {
            this.renderTable(chartId);
        }
    },

    /**
     * Attach event listeners for toolbar buttons
     * @param {string} chartId - Canvas element ID
     */
    attachEventListeners: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        // Toolbar button clicks
        wrapper.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const targetChartId = btn.dataset.chart;

                switch (action) {
                    case 'table':
                        this.showTableView(targetChartId);
                        break;
                    case 'chart':
                        this.showChartView(targetChartId);
                        break;
                    case 'fullscreen':
                        this.toggleFullscreen(targetChartId);
                        break;
                    case 'download':
                        this.downloadCSV(targetChartId);
                        break;
                    case 'search':
                        this.toggleSearch(targetChartId);
                        break;
                }
            });
        });

        // Search input
        const searchInput = wrapper.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(chartId, e.target.value);
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.toggleSearch(chartId);
                }
            });
        }
    },

    /**
     * Show table view, hide chart
     * @param {string} chartId - Canvas element ID
     */
    showTableView: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        const chartView = wrapper.querySelector('.chart-view');
        const tableView = wrapper.querySelector('.table-view');

        chartView.classList.remove('active');
        tableView.classList.add('active');

        // Render table data
        this.renderTable(chartId);
    },

    /**
     * Show chart view, hide table
     * @param {string} chartId - Canvas element ID
     */
    showChartView: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        const chartView = wrapper.querySelector('.chart-view');
        const tableView = wrapper.querySelector('.table-view');

        chartView.classList.add('active');
        tableView.classList.remove('active');

        // Hide search if open
        const searchInput = wrapper.querySelector('.search-input');
        if (searchInput) searchInput.classList.add('hidden');
    },

    /**
     * Render table with chart data
     * @param {string} chartId - Canvas element ID
     */
    renderTable: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        const chartInfo = this.chartData[chartId];
        if (!chartInfo || !chartInfo.data || !chartInfo.columns) return;

        const table = wrapper.querySelector('.data-table');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Clear existing
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>#</th>';
        chartInfo.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create rows
        chartInfo.data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="row-num">${index}</td>`;
            chartInfo.columns.forEach(col => {
                const td = document.createElement('td');
                const value = row[col.key];
                td.textContent = typeof value === 'number' ? value.toLocaleString() : (value || '');
                td.title = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    },

    /**
     * Toggle fullscreen mode
     * @param {string} chartId - Canvas element ID
     */
    toggleFullscreen: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper') || canvas.closest('.chart-container');
        if (!wrapper) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapper.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        }
    },

    /**
     * Toggle search input visibility
     * @param {string} chartId - Canvas element ID
     */
    toggleSearch: function (chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        const searchInput = wrapper.querySelector('.search-input');
        if (searchInput) {
            searchInput.classList.toggle('hidden');
            if (!searchInput.classList.contains('hidden')) {
                searchInput.focus();
            } else {
                searchInput.value = '';
                this.filterTable(chartId, '');
            }
        }
    },

    /**
     * Filter table rows based on search query
     * @param {string} chartId - Canvas element ID
     * @param {string} query - Search query
     */
    filterTable: function (chartId, query) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const wrapper = canvas.closest('.chart-wrapper');
        if (!wrapper) return;

        const tbody = wrapper.querySelector('.data-table tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    },

    /**
     * Download table data as CSV
     * @param {string} chartId - Canvas element ID
     */
    downloadCSV: function (chartId) {
        const chartInfo = this.chartData[chartId];
        if (!chartInfo || !chartInfo.data || !chartInfo.columns) return;

        // Build CSV
        const headers = chartInfo.columns.map(c => c.label);
        const rows = chartInfo.data.map(row =>
            chartInfo.columns.map(col => {
                const val = row[col.key];
                // Escape quotes and wrap in quotes if contains comma
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            })
        );

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const filename = `${chartInfo.title.replace(/[^a-z0-9]/gi, '_')}_data.csv`;
        saveAs(blob, filename);
    }
};
