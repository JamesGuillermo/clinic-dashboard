/**
 * Export Module
 * CSV export functionality
 */

const Export = {
    /**
     * Export filtered data to CSV
     * @param {Array} data - Data to export
     * @param {string} filename - Output filename
     */
    exportFilteredData: function (data, filename = 'clinic_export.csv') {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const csv = Papa.unparse(data.map(row => {
            // Convert Date objects to strings
            const processed = { ...row };
            if (processed[COLUMNS.DATE] instanceof Date) {
                processed[COLUMNS.DATE] = processed[COLUMNS.DATE].toISOString().split('T')[0];
            }
            return processed;
        }));

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    },

    /**
     * Export summary statistics
     * @param {Array} data - Data to summarize
     * @param {string} filename - Output filename
     */
    exportSummary: function (data, filename = 'clinic_summary.csv') {
        if (!data || data.length === 0) {
            alert('No data to summarize');
            return;
        }

        const uniquePatients = DataProcessor.getUniquePatients(data);
        const avgAge = DataProcessor.getAverageAge(data);

        const summary = {
            'Total Records': data.length,
            'Unique Patients': uniquePatients,
            'Avg Findings per Patient': (data.length / uniquePatients).toFixed(2),
            'Unique Companies': DataProcessor.getUniqueCount(data, COLUMNS.COMPANY),
            'Unique ICD Codes': DataProcessor.getUniqueCount(data, COLUMNS.ICD),
            'Unique Findings': DataProcessor.getUniqueCount(data, COLUMNS.FINDINGS),
            'Average Age': avgAge.toFixed(1),
            'Export Date': new Date().toISOString()
        };

        const csv = Papa.unparse([summary]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    },

    /**
     * Setup export button event listeners
     * @param {Function} getFilteredData - Function that returns current filtered data
     */
    setupEventListeners: function (getFilteredData) {
        const exportFilteredBtn = document.getElementById('exportFiltered');
        const exportSummaryBtn = document.getElementById('exportSummary');

        if (exportFilteredBtn) {
            exportFilteredBtn.addEventListener('click', () => {
                const data = getFilteredData();
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                this.exportFilteredData(data, `clinic_filtered_${timestamp}.csv`);
            });
        }

        if (exportSummaryBtn) {
            exportSummaryBtn.addEventListener('click', () => {
                const data = getFilteredData();
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                this.exportSummary(data, `clinic_summary_${timestamp}.csv`);
            });
        }
    }
};
