const { createLogger, format, transports } = require('winston')

const { combine, timestamp, printf } = format

const myFormat = printf(info => `${info.timestamp} [${info.level}] ${info.message}`)

module.exports.createLogger = () => createLogger({
    format: combine(
        timestamp(),
        myFormat,
    ),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
        new transports.Console(),
    ],
})
