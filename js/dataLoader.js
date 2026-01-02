/**
 * Data Loader Module
 * Handles CSV and Excel file parsing
 */

const DataLoader = {
    /**
     * Parse uploaded file (CSV or Excel)
     * @param {File} file - The uploaded file
     * @returns {Promise<Array>} - Parsed data array
     */
    parseFile: function (file) {
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension === 'csv') {
            return this.parseCSV(file);
        } else if (['xlsx', 'xls'].includes(extension)) {
            return this.parseExcel(file);
        } else {
            return Promise.reject(new Error('Unsupported file format. Please use CSV or Excel files.'));
        }
    },

    /**
     * Parse CSV file using PapaParse
     * @param {File} file - CSV file
     * @returns {Promise<Array>} - Parsed data
     */
    parseCSV: function (file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (results) {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    const processedData = DataLoader.processData(results.data);
                    resolve(processedData);
                },
                error: function (error) {
                    reject(new Error('Failed to parse CSV: ' + error.message));
                }
            });
        });
    },

    /**
     * Parse Excel file using SheetJS
     * @param {File} file - Excel file
     * @returns {Promise<Array>} - Parsed data
     */
    parseExcel: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                    // Get first sheet
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });
                    const processedData = DataLoader.processData(jsonData);
                    resolve(processedData);
                } catch (error) {
                    reject(new Error('Failed to parse Excel file: ' + error.message));
                }
            };

            reader.onerror = function () {
                reject(new Error('Failed to read file'));
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Process and clean loaded data
     * @param {Array} data - Raw parsed data
     * @returns {Array} - Processed data
     */
    processData: function (data) {
        return data.map(row => {
            const processed = { ...row };

            // Parse date column
            if (processed[COLUMNS.DATE]) {
                const dateVal = processed[COLUMNS.DATE];
                if (dateVal instanceof Date) {
                    processed[COLUMNS.DATE] = dateVal;
                } else {
                    const parsed = new Date(dateVal);
                    processed[COLUMNS.DATE] = isNaN(parsed.getTime()) ? null : parsed;
                }
            }

            // Parse age as number
            if (processed[COLUMNS.AGE] !== undefined) {
                const age = parseFloat(processed[COLUMNS.AGE]);
                processed[COLUMNS.AGE] = isNaN(age) ? null : age;
            }

            // Ensure employee number is string
            if (processed[COLUMNS.EMPLOYEE] !== undefined) {
                processed[COLUMNS.EMPLOYEE] = String(processed[COLUMNS.EMPLOYEE] || '');
            }

            return processed;
        }).filter(row => {
            // Filter out completely empty rows
            return Object.values(row).some(val => val !== null && val !== '' && val !== undefined);
        });
    },

    /**
     * Validate that required columns exist
     * @param {Array} data - Parsed data
     * @returns {Object} - Validation result with missing columns
     */
    validateColumns: function (data) {
        if (!data || data.length === 0) {
            return { valid: false, missing: Object.values(COLUMNS), message: 'No data found in file' };
        }

        const sampleRow = data[0];
        const existingColumns = Object.keys(sampleRow);
        const missingColumns = Object.values(COLUMNS).filter(col => !existingColumns.includes(col));

        return {
            valid: missingColumns.length === 0,
            missing: missingColumns,
            message: missingColumns.length > 0
                ? `Missing columns: ${missingColumns.join(', ')}`
                : 'All required columns found'
        };
    }
};
