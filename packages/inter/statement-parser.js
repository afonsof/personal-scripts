const bluebird = require('bluebird')
const moment = require('moment')
const fs = bluebird.promisifyAll(require('fs'))
const csv = require('async-csv')
const { PropertiesMapper } = require('../properties-mapper')

const { tableToObject } = require('../table-converter')

const parseDate = date => moment.utc(date, 'DD-MM-YYYY').toDate()

module.exports.parseFromCsvFile = async (csvFilePath, account) => {
    const content = await fs.readFileAsync(csvFilePath, 'latin1')
    const startPos = content.indexOf('DATA LANÇAMENTO;HISTÓRICO;VALOR;SALDO')
    const csvContent = content.substring(startPos)
    const table = await csv.parse(csvContent, { delimiter: ';' })
    const obj = tableToObject(table)

    const propertiesMapper = new PropertiesMapper({
        date: 'DATA LANÇAMENTO',
        description: 'HISTÓRICO',
        value: 'VALOR',
    })

    return propertiesMapper.unmap(obj).map(row => ({
        ...row,
        value: Number.parseFloat(row.value
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/\s+/g, '')),
        date: parseDate(row.date),
        description: row.description ? row.description.toUpperCase() : '',
        account,
    }))
}
