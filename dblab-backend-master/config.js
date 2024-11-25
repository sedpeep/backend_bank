module.exports = {
  port: process.env.PORT || 5000,
  JwtKey: process.env.JWT_KEY || "",
  environment: process.env.NODE_ENV || "dev",
  LOGGER_LEVEL: "info",
  MAINTENANCE: false,
};
