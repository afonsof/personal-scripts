const moment = require('moment')

module.exports.stringToDate = text => moment(`${text} +0000`, 'YYYY|MM|DD Z').toDate()

module.exports.dateToString = inDate => moment.utc(inDate).format('YYYY|MM|DD')
