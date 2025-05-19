const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info", // Minimum log level to capture
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),        // Show stack trace for errors
    format.splat(),                        // Allow string interpolation
    format.json()                         // Output logs as JSON (good for files)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),                 // Colorize console output
        format.simple()                   // Simple text output for console
      ),
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;
