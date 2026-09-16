/**
 * Custom Error Class representing operational/business logic errors.
 * Extends the native JavaScript Error class.
 */
class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - The error message details
   * @param {number} statusCode - HTTP Status Code (e.g. 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Set status as 'fail' for 4xx errors, and 'error' for 5xx/others
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Identifies operational errors (errors we anticipate and handle) vs bugs
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
