import winston from 'winston';

// Provide colors for log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, tenant }) => {
            return `[${timestamp}] [${level}] [${tenant||''}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

// // Configure the logger instance
// const logger = winston.createLogger({
//     levels: logLevels,
//     format: winston.format.combine(
//         winston.format.colorize({ all: true }),
//         winston.format.timestamp(),
//         winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
//     ),
//     transports: [
//         new winston.transports.Console(),
//         // Add other transports such as File or database if needed
//     ],
// });


export default logger;