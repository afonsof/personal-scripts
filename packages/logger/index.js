const { createLogger, format, transports } = require('winston')

const { combine, timestamp, printf } = format

const myFormat = printf(info => `${info.timestamp} [${info.level}] ${info.message}`)

module.exports.createLogger = () => createLogger({
    format: combine(
        timestamp(),
        myFormat,
    ),
    transports: [
        new transports.Console(),
    ],
})
