/**
 * Charts Module
 * Chart.js visualizations
 */

const Charts = {
    // Store chart instances for cleanup
    instances: {},

    /**
     * Destroy existing chart before creating new one
     * @param {string} chartId - Canvas element ID
     */
    destroyChart: function (chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    /**
     * Get chart context
     * @param {string} chartId - Canvas element ID
     * @returns {CanvasRenderingContext2D|null}
     */
    getContext: function (chartId) {
        const canvas = document.getElementById(chartId);
        return canvas ? canvas.getContext('2d') : null;
    },

    /**
     * Daily patients bar chart
     * @param {Array} data - Processed data
     */
    renderDailyPatients: function (data) {
        const chartId = 'dailyPatientsChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const dailyData = DataProcessor.getPatientsPerDay(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dailyData.map(d => this.formatDateLabel(d.date)),
                datasets: [{
                    label: 'Unique Patients',
                    data: dailyData.map(d => d.count),
                    backgroundColor: COLORS.green,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Daily Patient Visits', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { maxRotation: 45, minRotation: 45 } },
                    y: { beginAtZero: true, title: { display: true, text: 'Unique Patients' } }
                }
            }
        });
    },

    /**
     * Monthly patients line chart
     * @param {Array} data - Processed data
     */
    renderMonthlyPatients: function (data) {
        const chartId = 'monthlyPatientsChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const monthlyData = DataProcessor.getPatientsPerMonth(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(d => this.formatMonthLabel(d.month)),
                datasets: [{
                    label: 'Unique Patients',
                    data: monthlyData.map(d => d.count),
                    borderColor: COLORS.orange,
                    backgroundColor: COLORS.orange + '33',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Monthly Patient Trend', color: COLORS.textLight }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Unique Patients' } }
                }
            }
        });
    },

    /**
     * Comparison chart: total records vs unique patients
     * @param {Array} data - Processed data
     */
    renderComparison: function (data) {
        const chartId = 'comparisonChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const dailyStats = DataProcessor.getDailyStats(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyStats.map(d => this.formatDateLabel(d.date)),
                datasets: [
                    {
                        label: 'Total Records',
                        data: dailyStats.map(d => d.totalRecords),
                        borderColor: COLORS.purple,
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 3
                    },
                    {
                        label: 'Unique Patients',
                        data: dailyStats.map(d => d.uniquePatients),
                        borderColor: COLORS.green,
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Records vs Unique Patients', color: COLORS.textLight }
                },
                scales: {
                    x: { ticks: { maxRotation: 45, minRotation: 45 } },
                    y: { beginAtZero: true }
                }
            }
        });
    },

    /**
     * Daily findings bar chart
     * @param {Array} data - Processed data
     */
    renderDailyFindings: function (data) {
        const chartId = 'dailyFindingsChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const dailyData = DataProcessor.getFindingsPerDay(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dailyData.map(d => this.formatDateLabel(d.date)),
                datasets: [{
                    label: 'Total Findings',
                    data: dailyData.map(d => d.total),
                    backgroundColor: COLORS.red,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Daily Clinical Findings', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { maxRotation: 45, minRotation: 45 } },
                    y: { beginAtZero: true, title: { display: true, text: 'Total Findings' } }
                }
            }
        });
    },

    /**
     * Monthly findings line chart
     * @param {Array} data - Processed data
     */
    renderMonthlyFindings: function (data) {
        const chartId = 'monthlyFindingsChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const monthlyData = DataProcessor.getFindingsPerMonth(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(d => this.formatMonthLabel(d.month)),
                datasets: [{
                    label: 'Total Findings',
                    data: monthlyData.map(d => d.total),
                    borderColor: COLORS.red,
                    backgroundColor: COLORS.red + '33',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Monthly Clinical Findings Trend', color: COLORS.textLight }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Total Findings' } }
                }
            }
        });
    },

    /**
     * Top findings horizontal bar chart
     * @param {Array} data - Processed data
     * @param {number} topN - Number of items
     */
    renderTopFindings: function (data, topN = 15) {
        const chartId = 'topFindingsChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const findings = DataProcessor.getTopFindings(data, topN);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: findings.map(f => this.truncateLabel(f.finding, 40)),
                datasets: [{
                    label: 'Count',
                    data: findings.map(f => f.count),
                    backgroundColor: this.generateGradientColors(findings.length, COLORS.cyan, COLORS.purple),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top Clinical Findings', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    },

    /**
     * Company distribution horizontal bar chart
     * @param {Array} data - Processed data
     * @param {number} topN - Number of items
     */
    renderCompanyDistribution: function (data, topN = 15) {
        const chartId = 'companyChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const companies = DataProcessor.getCompanyDistribution(data, topN);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: companies.map(c => this.truncateLabel(c.company, 30)),
                datasets: [{
                    label: 'Unique Patients',
                    data: companies.map(c => c.count),
                    backgroundColor: COLORS.primary,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top Companies by Unique Patients', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Unique Patients' } }
                }
            }
        });
    },

    /**
     * Purpose distribution doughnut chart
     * @param {Array} data - Processed data
     * @param {number} topN - Number of items
     */
    renderPurposeDistribution: function (data, topN = 10) {
        const chartId = 'purposeChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const purposes = DataProcessor.getPurposeDistribution(data, topN);

        this.instances[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: purposes.map(p => this.truncateLabel(p.purpose, 25)),
                datasets: [{
                    data: purposes.map(p => p.count),
                    backgroundColor: this.generatePaletteColors(purposes.length),
                    borderColor: COLORS.background,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Purpose of Visit', color: COLORS.textLight },
                    legend: { position: 'right', labels: { boxWidth: 12 } }
                }
            }
        });
    },

    /**
     * Sex distribution doughnut chart
     * @param {Array} data - Processed data
     */
    renderSexDistribution: function (data) {
        const chartId = 'sexChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const sexData = DataProcessor.getSexDistribution(data);

        const colorMap = {
            'MALE': COLORS.blue,
            'FEMALE': COLORS.pink,
            'Male': COLORS.blue,
            'Female': COLORS.pink
        };

        this.instances[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sexData.map(s => s.sex),
                datasets: [{
                    data: sexData.map(s => s.count),
                    backgroundColor: sexData.map(s => colorMap[s.sex] || COLORS.text),
                    borderColor: COLORS.background,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Sex Distribution', color: COLORS.textLight }
                }
            }
        });
    },

    /**
     * Age distribution histogram
     * @param {Array} data - Processed data
     */
    renderAgeDistribution: function (data) {
        const chartId = 'ageChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const ages = DataProcessor.getAgeDistribution(data);

        // Create histogram bins
        const bins = {};
        const binSize = 5;
        ages.forEach(age => {
            const bin = Math.floor(age / binSize) * binSize;
            bins[bin] = (bins[bin] || 0) + 1;
        });

        const sortedBins = Object.entries(bins)
            .map(([bin, count]) => ({ bin: parseInt(bin), count }))
            .sort((a, b) => a.bin - b.bin);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedBins.map(b => `${b.bin}-${b.bin + binSize - 1}`),
                datasets: [{
                    label: 'Patients',
                    data: sortedBins.map(b => b.count),
                    backgroundColor: COLORS.green,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Age Distribution', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Age (Years)' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Patients' } }
                }
            }
        });
    },

    /**
     * Weekday distribution bar chart
     * @param {Array} data - Processed data
     */
    renderWeekdayDistribution: function (data) {
        const chartId = 'weekdayChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const weekdayData = DataProcessor.getWeekdayDistribution(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekdayData.map(w => w.weekday.substring(0, 3)),
                datasets: [{
                    label: 'Unique Patients',
                    data: weekdayData.map(w => w.count),
                    backgroundColor: COLORS.pink,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Patients by Day of Week', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Unique Patients' } }
                }
            }
        });
    },

    /**
     * Age bracket distribution bar chart
     * @param {Array} data - Processed data
     */
    renderAgeBracketDistribution: function (data) {
        const chartId = 'ageBracketChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const bracketData = DataProcessor.getAgeBracketDistribution(data);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bracketData.map(b => b.bracket),
                datasets: [{
                    label: 'Unique Patients',
                    data: bracketData.map(b => b.count),
                    backgroundColor: this.generateGradientColors(bracketData.length, COLORS.cyan, COLORS.purple),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Patients by Age Bracket', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Unique Patients' } }
                }
            }
        });
    },

    /**
     * ICD distribution horizontal bar chart
     * @param {Array} data - Processed data
     * @param {number} topN - Number of items
     */
    renderICDDistribution: function (data, topN = 15) {
        const chartId = 'icdChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const icdData = DataProcessor.getICDDistribution(data, topN);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: icdData.map(i => this.truncateLabel(i.icd, 30)),
                datasets: [{
                    label: 'Count',
                    data: icdData.map(i => i.count),
                    backgroundColor: COLORS.purple,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top ICD Codes', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    },

    /**
     * Label distribution horizontal bar chart
     * @param {Array} data - Processed data
     * @param {number} topN - Number of items
     */
    renderLabelDistribution: function (data, topN = 15) {
        const chartId = 'labelChart';
        this.destroyChart(chartId);
        const ctx = this.getContext(chartId);
        if (!ctx) return;

        const labelData = DataProcessor.getLabelDistribution(data, topN);

        this.instances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labelData.map(l => this.truncateLabel(l.label, 30)),
                datasets: [{
                    label: 'Count',
                    data: labelData.map(l => l.count),
                    backgroundColor: COLORS.cyan,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top Diagnosis Labels', color: COLORS.textLight },
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    },

    /**
     * Render all charts
     * @param {Array} data - Processed data
     * @param {number} topN - Number of top items
     */
    renderAll: function (data, topN = 15) {
        this.renderDailyPatients(data);
        this.renderMonthlyPatients(data);
        this.renderComparison(data);
        this.renderDailyFindings(data);
        this.renderMonthlyFindings(data);
        this.renderTopFindings(data, topN);
        this.renderCompanyDistribution(data, topN);
        this.renderPurposeDistribution(data, topN);
        this.renderSexDistribution(data);
        this.renderAgeDistribution(data);
        this.renderWeekdayDistribution(data);
        this.renderAgeBracketDistribution(data);
        this.renderICDDistribution(data, topN);
        this.renderLabelDistribution(data, topN);

        // Initialize toolbars with data
        this.initAllToolbars(data, topN);
    },

    /**
     * Initialize toolbars for all charts with their data
     * @param {Array} data - Processed data
     * @param {number} topN - Number of top items
     */
    initAllToolbars: function (data, topN = 15) {
        // Daily Patients
        const dailyPatientsData = DataProcessor.getPatientsPerDay(data);
        ChartToolbar.init('dailyPatientsChart', 'Daily Patient Visits',
            dailyPatientsData.map((d, i) => ({ Date: this.formatDateLabel(d.date), Unique_Patients: d.count })),
            [{ key: 'Date', label: 'Date' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Monthly Patients
        const monthlyPatientsData = DataProcessor.getPatientsPerMonth(data);
        ChartToolbar.init('monthlyPatientsChart', 'Monthly Patient Trend',
            monthlyPatientsData.map(d => ({ Month: this.formatMonthLabel(d.month), Unique_Patients: d.count })),
            [{ key: 'Month', label: 'Month' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Comparison
        const dailyStats = DataProcessor.getDailyStats(data);
        ChartToolbar.init('comparisonChart', 'Records vs Unique Patients',
            dailyStats.map(d => ({ Date: this.formatDateLabel(d.date), Total_Records: d.totalRecords, Unique_Patients: d.uniquePatients })),
            [{ key: 'Date', label: 'Date' }, { key: 'Total_Records', label: 'Total Records' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Daily Findings
        const dailyFindingsData = DataProcessor.getFindingsPerDay(data);
        ChartToolbar.init('dailyFindingsChart', 'Daily Clinical Findings',
            dailyFindingsData.map(d => ({ Date: this.formatDateLabel(d.date), Total_Findings: d.total })),
            [{ key: 'Date', label: 'Date' }, { key: 'Total_Findings', label: 'Total Findings' }]
        );

        // Monthly Findings
        const monthlyFindingsData = DataProcessor.getFindingsPerMonth(data);
        ChartToolbar.init('monthlyFindingsChart', 'Monthly Clinical Findings',
            monthlyFindingsData.map(d => ({ Month: this.formatMonthLabel(d.month), Total_Findings: d.total })),
            [{ key: 'Month', label: 'Month' }, { key: 'Total_Findings', label: 'Total Findings' }]
        );

        // Top Findings
        const topFindings = DataProcessor.getTopFindings(data, topN);
        ChartToolbar.init('topFindingsChart', 'Top Clinical Findings',
            topFindings.map(f => ({ Finding: f.finding, Count: f.count })),
            [{ key: 'Finding', label: 'Finding' }, { key: 'Count', label: 'Count' }]
        );

        // Company Distribution
        const companies = DataProcessor.getCompanyDistribution(data, topN);
        ChartToolbar.init('companyChart', 'Top Companies',
            companies.map(c => ({ Company: c.company, Unique_Patients: c.count })),
            [{ key: 'Company', label: 'Company' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Purpose Distribution
        const purposes = DataProcessor.getPurposeDistribution(data, topN);
        ChartToolbar.init('purposeChart', 'Purpose of Visit',
            purposes.map(p => ({ Purpose: p.purpose, Unique_Patients: p.count })),
            [{ key: 'Purpose', label: 'Purpose' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Sex Distribution
        const sexData = DataProcessor.getSexDistribution(data);
        ChartToolbar.init('sexChart', 'Sex Distribution',
            sexData.map(s => ({ Sex: s.sex, Unique_Patients: s.count })),
            [{ key: 'Sex', label: 'Sex' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Age Distribution (histogram bins)
        const ages = DataProcessor.getAgeDistribution(data);
        const bins = {};
        const binSize = 5;
        ages.forEach(age => {
            const bin = Math.floor(age / binSize) * binSize;
            bins[bin] = (bins[bin] || 0) + 1;
        });
        const sortedBins = Object.entries(bins)
            .map(([bin, count]) => ({ Age_Range: `${bin}-${parseInt(bin) + binSize - 1}`, Patients: count }))
            .sort((a, b) => parseInt(a.Age_Range) - parseInt(b.Age_Range));
        ChartToolbar.init('ageChart', 'Age Distribution', sortedBins,
            [{ key: 'Age_Range', label: 'Age Range' }, { key: 'Patients', label: 'Patients' }]
        );

        // Weekday Distribution
        const weekdayData = DataProcessor.getWeekdayDistribution(data);
        ChartToolbar.init('weekdayChart', 'Patients by Day of Week',
            weekdayData.map(w => ({ Weekday: w.weekday, Unique_Patients: w.count })),
            [{ key: 'Weekday', label: 'Weekday' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // Age Bracket Distribution
        const bracketData = DataProcessor.getAgeBracketDistribution(data);
        ChartToolbar.init('ageBracketChart', 'Patients by Age Bracket',
            bracketData.map(b => ({ Age_Bracket: b.bracket, Unique_Patients: b.count })),
            [{ key: 'Age_Bracket', label: 'Age Bracket' }, { key: 'Unique_Patients', label: 'Unique Patients' }]
        );

        // ICD Distribution
        const icdData = DataProcessor.getICDDistribution(data, topN);
        ChartToolbar.init('icdChart', 'Top ICD Codes',
            icdData.map(i => ({ ICD_Code: i.icd, Count: i.count })),
            [{ key: 'ICD_Code', label: 'ICD Code' }, { key: 'Count', label: 'Count' }]
        );

        // Label Distribution
        const labelData = DataProcessor.getLabelDistribution(data, topN);
        ChartToolbar.init('labelChart', 'Top Diagnosis Labels',
            labelData.map(l => ({ Label: l.label, Count: l.count })),
            [{ key: 'Label', label: 'Label' }, { key: 'Count', label: 'Count' }]
        );
    },

    // Helper functions
    formatDateLabel: function (dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatMonthLabel: function (monthStr) {
        const [year, month] = monthStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${year}`;
    },

    truncateLabel: function (text, maxLength) {
        if (!text) return 'N/A';
        text = String(text);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    generateGradientColors: function (count, startColor, endColor) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const ratio = i / (count - 1 || 1);
            colors.push(this.interpolateColor(startColor, endColor, ratio));
        }
        return colors;
    },

    interpolateColor: function (color1, color2, ratio) {
        const hex = (color) => {
            color = color.replace('#', '');
            return {
                r: parseInt(color.substring(0, 2), 16),
                g: parseInt(color.substring(2, 4), 16),
                b: parseInt(color.substring(4, 6), 16)
            };
        };
        const c1 = hex(color1);
        const c2 = hex(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
        const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
        const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
        return `rgb(${r}, ${g}, ${b})`;
    },

    generatePaletteColors: function (count) {
        const palette = [
            '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
            '#14b8a6', '#a855f7', '#eab308', '#0ea5e9', '#f43f5e'
        ];
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }
};
