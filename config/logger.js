const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info", 
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),              
    format.json()                         
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),  
        format.simple()     
      ),
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
  exitOnError: false, 
});

module.exports = logger;
