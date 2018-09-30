const path = require('path')
const moment = require('moment')
const { parseFromCsvFile } = require('./statement-parser')

const expectedStatement = [
    {
        account: 'sample-account',
        date: moment('2018-09-10T00:00:00.000Z').toDate(),
        description: 'SALÁRIO',
        value: 2284.32,
    },
    {
        account: 'sample-account',
        date: moment('2018-09-10T00:00:00.000Z').toDate(),
        description: 'PAGAMENTO DE BOLETO',
        value: 270,
    },
]

describe('statement-parser', () => {
    it('parseFromCsvFile', async () => {
        const statement = await parseFromCsvFile(
            path.join(__dirname, 'sample-data/statement.csv'),
            'sample-account',
        )
        statement.should.be.deep.equal(expectedStatement)
    })
})
