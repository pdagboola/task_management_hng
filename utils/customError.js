class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = CustomError;
