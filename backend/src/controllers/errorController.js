const AppError = require('../utils/appError');

/**
 * Handle Mongoose Cast Errors (e.g., invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Noto'g'ri ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Field Errors
 */
const handleDuplicateFieldsDB = (err) => {
  // Extract duplicate field value from the error message
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : '';
  const message = `Ushbu qiymat allaqachon mavjud: ${value}. Iltimos, boshqa qiymat kiriting!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Kiritilgan ma'lumotlar noto'g'ri. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Verification Errors
 */
const handleJWTError = () =>
  new AppError('Noto\'g\'ri token. Iltimos, qaytadan tizimga kiring!', 401);

/**
 * Handle Expired JWT Errors
 */
const handleJWTExpiredError = () =>
  new AppError('Token muddati tugagan. Iltimos, qaytadan tizimga kiring!', 401);

/**
 * Development Error Response: Send maximum information
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Production Error Response: Send clean and secure messages
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Nimadir xato ketdi. Iltimos, keyinroq qayta urinib ko\'ring.',
    });
  }
};

/**
 * Global Error Handler Middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err); // Create a shallow copy
    
    // Check for specific Mongoose/MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    
    // Check for specific JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
