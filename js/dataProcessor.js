/**
 * Data Processor Module
 * Analytics functions converted from Python Pandas
 */

const DataProcessor = {
    /**
     * Get count of unique patients based on EMPLOYEE NO.
     * @param {Array} data - Data array
     * @returns {number} - Unique patient count
     */
    getUniquePatients: function (data) {
        if (!data || data.length === 0) return 0;
        const uniqueIds = new Set(data.map(row => row[COLUMNS.EMPLOYEE]).filter(id => id));
        return uniqueIds.size;
    },

    /**
     * Count unique patients per day
     * @param {Array} data - Data array
     * @returns {Array} - Array of { date, count }
     */
    getPatientsPerDay: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            if (!date) return;

            const dateKey = this.formatDateKey(date);
            if (!grouped[dateKey]) {
                grouped[dateKey] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[dateKey].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([date, patients]) => ({
                date: date,
                count: patients.size
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    /**
     * Count unique patients per month
     * @param {Array} data - Data array
     * @returns {Array} - Array of { month, count }
     */
    getPatientsPerMonth: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            if (!date) return;

            const monthKey = this.formatMonthKey(date);
            if (!grouped[monthKey]) {
                grouped[monthKey] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[monthKey].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([month, patients]) => ({
                month: month,
                count: patients.size
            }))
            .sort((a, b) => new Date(a.month + '-01') - new Date(b.month + '-01'));
    },

    /**
     * Get daily stats: total records vs unique patients
     * @param {Array} data - Data array
     * @returns {Array} - Array of { date, totalRecords, uniquePatients }
     */
    getDailyStats: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            if (!date) return;

            const dateKey = this.formatDateKey(date);
            if (!grouped[dateKey]) {
                grouped[dateKey] = { records: 0, patients: new Set() };
            }
            grouped[dateKey].records++;
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[dateKey].patients.add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([date, stats]) => ({
                date: date,
                totalRecords: stats.records,
                uniquePatients: stats.patients.size
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    /**
     * Count findings per day
     * @param {Array} data - Data array
     * @returns {Array} - Array of { date, total, unique }
     */
    getFindingsPerDay: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            const finding = row[COLUMNS.FINDINGS];
            if (!date) return;

            const dateKey = this.formatDateKey(date);
            if (!grouped[dateKey]) {
                grouped[dateKey] = { total: 0, unique: new Set() };
            }
            if (finding) {
                grouped[dateKey].total++;
                grouped[dateKey].unique.add(finding);
            }
        });

        return Object.entries(grouped)
            .map(([date, stats]) => ({
                date: date,
                total: stats.total,
                unique: stats.unique.size
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    /**
     * Count findings per month
     * @param {Array} data - Data array
     * @returns {Array} - Array of { month, total, unique }
     */
    getFindingsPerMonth: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            const finding = row[COLUMNS.FINDINGS];
            if (!date) return;

            const monthKey = this.formatMonthKey(date);
            if (!grouped[monthKey]) {
                grouped[monthKey] = { total: 0, unique: new Set() };
            }
            if (finding) {
                grouped[monthKey].total++;
                grouped[monthKey].unique.add(finding);
            }
        });

        return Object.entries(grouped)
            .map(([month, stats]) => ({
                month: month,
                total: stats.total,
                unique: stats.unique.size
            }))
            .sort((a, b) => new Date(a.month + '-01') - new Date(b.month + '-01'));
    },

    /**
     * Get top N findings
     * @param {Array} data - Data array
     * @param {number} topN - Number of top items
     * @returns {Array} - Array of { finding, count }
     */
    getTopFindings: function (data, topN = 15) {
        const counts = {};

        data.forEach(row => {
            const finding = row[COLUMNS.FINDINGS];
            if (finding) {
                counts[finding] = (counts[finding] || 0) + 1;
            }
        });

        return Object.entries(counts)
            .map(([finding, count]) => ({ finding, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    },

    /**
     * Get company distribution by unique patients
     * @param {Array} data - Data array
     * @param {number} topN - Number of top items
     * @returns {Array} - Array of { company, count }
     */
    getCompanyDistribution: function (data, topN = 15) {
        const grouped = {};

        data.forEach(row => {
            const company = row[COLUMNS.COMPANY];
            if (!company) return;

            if (!grouped[company]) {
                grouped[company] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[company].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([company, patients]) => ({
                company: company,
                count: patients.size
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    },

    /**
     * Get purpose distribution by unique patients
     * @param {Array} data - Data array
     * @param {number} topN - Number of top items
     * @returns {Array} - Array of { purpose, count }
     */
    getPurposeDistribution: function (data, topN = 10) {
        const grouped = {};

        data.forEach(row => {
            const purpose = row[COLUMNS.PURPOSE];
            if (!purpose) return;

            if (!grouped[purpose]) {
                grouped[purpose] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[purpose].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([purpose, patients]) => ({
                purpose: purpose,
                count: patients.size
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    },

    /**
     * Get sex distribution by unique patients
     * @param {Array} data - Data array
     * @returns {Array} - Array of { sex, count }
     */
    getSexDistribution: function (data) {
        const grouped = {};

        data.forEach(row => {
            const sex = row[COLUMNS.SEX] || 'Unknown';
            if (!grouped[sex]) {
                grouped[sex] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[sex].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return Object.entries(grouped)
            .map(([sex, patients]) => ({
                sex: sex,
                count: patients.size
            }));
    },

    /**
     * Categorize age into bracket
     * @param {number} age - Age value
     * @returns {string} - Age bracket label
     */
    categorizeAgeBracket: function (age) {
        if (age === null || age === undefined || isNaN(age)) return 'Unknown';
        age = Math.floor(age);
        if (age < 18) return '<18';
        if (age <= 24) return '18-24';
        if (age <= 34) return '25-34';
        if (age <= 44) return '35-44';
        if (age <= 54) return '45-54';
        if (age <= 64) return '55-64';
        if (age <= 74) return '65-74';
        if (age <= 84) return '75-84';
        return '85+';
    },

    /**
     * Get age bracket distribution by unique patients
     * @param {Array} data - Data array
     * @returns {Array} - Array of { bracket, count }
     */
    getAgeBracketDistribution: function (data) {
        const grouped = {};
        const seen = new Set();

        data.forEach(row => {
            const employee = row[COLUMNS.EMPLOYEE];
            if (!employee || seen.has(employee)) return;
            seen.add(employee);

            const age = row[COLUMNS.AGE];
            const bracket = this.categorizeAgeBracket(age);
            grouped[bracket] = (grouped[bracket] || 0) + 1;
        });

        // Sort by bracket order
        return AGE_BRACKETS
            .filter(bracket => grouped[bracket])
            .map(bracket => ({
                bracket: bracket,
                count: grouped[bracket] || 0
            }));
    },

    /**
     * Get age distribution (histogram data)
     * @param {Array} data - Data array
     * @returns {Array} - Array of ages for unique patients
     */
    getAgeDistribution: function (data) {
        const seen = new Set();
        const ages = [];

        data.forEach(row => {
            const employee = row[COLUMNS.EMPLOYEE];
            if (!employee || seen.has(employee)) return;
            seen.add(employee);

            const age = row[COLUMNS.AGE];
            if (age !== null && age !== undefined && !isNaN(age)) {
                ages.push(age);
            }
        });

        return ages;
    },

    /**
     * Get weekday distribution by unique patients
     * @param {Array} data - Data array
     * @returns {Array} - Array of { weekday, count }
     */
    getWeekdayDistribution: function (data) {
        const grouped = {};

        data.forEach(row => {
            const date = row[COLUMNS.DATE];
            if (!date) return;

            const weekday = WEEKDAYS[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1];
            if (!grouped[weekday]) {
                grouped[weekday] = new Set();
            }
            if (row[COLUMNS.EMPLOYEE]) {
                grouped[weekday].add(row[COLUMNS.EMPLOYEE]);
            }
        });

        return WEEKDAYS.map(weekday => ({
            weekday: weekday,
            count: grouped[weekday] ? grouped[weekday].size : 0
        }));
    },

    /**
     * Get ICD code distribution
     * @param {Array} data - Data array
     * @param {number} topN - Number of top items
     * @returns {Array} - Array of { icd, count }
     */
    getICDDistribution: function (data, topN = 15) {
        const counts = {};

        data.forEach(row => {
            const icd = row[COLUMNS.ICD] || 'No ICD';
            counts[icd] = (counts[icd] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([icd, count]) => ({ icd, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    },

    /**
     * Get diagnosis label distribution
     * @param {Array} data - Data array
     * @param {number} topN - Number of top items
     * @returns {Array} - Array of { label, count }
     */
    getLabelDistribution: function (data, topN = 15) {
        const counts = {};

        data.forEach(row => {
            const label = row[COLUMNS.LABEL] || 'Unclassified';
            counts[label] = (counts[label] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    },

    /**
     * Get peak month and its top finding
     * @param {Array} data - Data array
     * @returns {Object} - { monthName, topFinding, count }
     */
    getPeakMonthFinding: function (data) {
        const monthlyFindings = this.getFindingsPerMonth(data);
        if (monthlyFindings.length === 0) return { monthName: 'N/A', topFinding: 'N/A', count: 0 };

        // Find peak month
        const peak = monthlyFindings.reduce((max, curr) => curr.total > max.total ? curr : max);

        // Get findings for peak month
        const peakMonthData = data.filter(row => {
            const date = row[COLUMNS.DATE];
            if (!date) return false;
            return this.formatMonthKey(date) === peak.month;
        });

        const topFindings = this.getTopFindings(peakMonthData, 1);
        const topFinding = topFindings.length > 0 ? topFindings[0].finding : 'N/A';

        // Format month name
        const [year, month] = peak.month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;

        return { monthName, topFinding, count: topFindings.length > 0 ? topFindings[0].count : 0 };
    },

    /**
     * Get largest age bracket and its top finding
     * @param {Array} data - Data array
     * @returns {Object} - { bracket, topFinding, count }
     */
    getLargestAgeBracketFinding: function (data) {
        const brackets = this.getAgeBracketDistribution(data);
        if (brackets.length === 0) return { bracket: 'N/A', topFinding: 'N/A', count: 0 };

        // Find largest bracket (excluding Unknown)
        const validBrackets = brackets.filter(b => b.bracket !== 'Unknown');
        if (validBrackets.length === 0) return { bracket: 'N/A', topFinding: 'N/A', count: 0 };

        const largest = validBrackets.reduce((max, curr) => curr.count > max.count ? curr : max);

        // Get findings for this bracket
        const bracketData = data.filter(row => {
            return this.categorizeAgeBracket(row[COLUMNS.AGE]) === largest.bracket;
        });

        const topFindings = this.getTopFindings(bracketData, 1);
        const topFinding = topFindings.length > 0 ? topFindings[0].finding : 'N/A';

        return {
            bracket: largest.bracket,
            topFinding,
            count: topFindings.length > 0 ? topFindings[0].count : 0
        };
    },

    /**
     * Calculate average age of unique patients
     * @param {Array} data - Data array
     * @returns {number} - Average age
     */
    getAverageAge: function (data) {
        const ages = this.getAgeDistribution(data);
        if (ages.length === 0) return 0;
        const sum = ages.reduce((a, b) => a + b, 0);
        return sum / ages.length;
    },

    /**
     * Get unique count for a column
     * @param {Array} data - Data array
     * @param {string} column - Column name
     * @returns {number} - Unique count
     */
    getUniqueCount: function (data, column) {
        const unique = new Set(data.map(row => row[column]).filter(val => val));
        return unique.size;
    },

    // Helper functions
    formatDateKey: function (date) {
        if (!(date instanceof Date)) date = new Date(date);
        return date.toISOString().split('T')[0];
    },

    formatMonthKey: function (date) {
        if (!(date instanceof Date)) date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
};
