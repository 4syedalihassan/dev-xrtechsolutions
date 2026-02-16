/**
 * Central Logger Utility
 * 
 * Standardizes logging across the application.
 * Currently wraps console methods but allows for easy extension
 * to external services (Sentry, LogRocket, etc.) in the future.
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

// Current log level (can be set via env var)
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production'
    ? LOG_LEVELS.INFO
    : LOG_LEVELS.DEBUG;

const logger = {
    debug: (message, ...args) => {
        if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },

    info: (message, ...args) => {
        if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    warn: (message, ...args) => {
        if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },

    error: (message, error = null, ...args) => {
        if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
            if (error) {
                console.error(`[ERROR] ${message}`, error, ...args);
            } else {
                console.error(`[ERROR] ${message}`, ...args);
            }
        }
    },

    /**
     * Log an API error with consistent formatting
     * @param {string} endpoint - API endpoint name
     * @param {Error} error - Error object
     * @param {Object} context - Additional context
     */
    logApiError: (endpoint, error, context = {}) => {
        console.error(`[API ERROR] ${endpoint}:`, {
            message: error.message,
            stack: error.stack,
            context,
        });
    }
};

export default logger;
