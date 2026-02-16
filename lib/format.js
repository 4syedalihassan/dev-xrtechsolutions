/**
 * Format a number as a currency string.
 * Uses strict formatting for PKR (Rs) to ensure consistency across the app.
 * 
 * @param {number|string} amount - The amount to format
 * @param {object} options - Optional configuration
 * @param {boolean} options.showSymbol - Whether to show the currency symbol (default: true)
 * @param {string} options.currency - Currency code (default: 'PKR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
    const { showSymbol = true } = options;

    // Parse amount to number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle invalid numbers
    if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
        return showSymbol ? 'Rs 0' : '0';
    }

    // Format with commas
    const formattedNumber = new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);

    if (!showSymbol) {
        return formattedNumber;
    }

    // Standard PKR formatting: "Rs 1,500"
    return `Rs ${formattedNumber}`;
};
