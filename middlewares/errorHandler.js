const CustomError = require("../utils/customError");

const errorHandlingMiddleware = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandlingMiddleware;
