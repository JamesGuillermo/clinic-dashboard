/**
 * Clinic Dashboard Configuration
 * Column mappings and constants
 */

const COLUMNS = {
    DATE: 'APPOINTMENT DATE',
    PURPOSE: 'PURPOSE OF VISIT',
    EMPLOYEE: 'EMPLOYEE NO.',
    SEX: 'SEX',
    COMPANY: 'COMPANY NAME',
    MONTH: 'MONTHS',
    AGE: 'AGE YEARS',
    FINDINGS: 'CLEAN FINDINGS (NEW)',
    ICD: 'ICD_PRIMARY',
    LABEL: 'STD_LABEL_FULL'
};

// Chart colors (matching the Python version)
const COLORS = {
    primary: '#00d4ff',
    green: '#22c55e',
    orange: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    pink: '#f472b6',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    text: '#a0aec0',
    textLight: '#e2e8f0',
    background: '#0e1117',
    backgroundSecondary: '#1a1f2e',
    border: '#2d3748'
};

// Age bracket order
const AGE_BRACKETS = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+', 'Unknown'];

// Weekday order
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Chart.js default configuration
Chart.defaults.color = COLORS.text;
Chart.defaults.borderColor = COLORS.border;
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
