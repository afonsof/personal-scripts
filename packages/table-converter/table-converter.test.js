const tableConverter = require('./table-converter')

const sampleTable = [
    ['a', 'b', 'c'],
    ['1', '2', '3'],
    ['4', '5', '6'],
]

const sampleObj = [
    { a: '1', b: '2', c: '3' },
    { a: '4', b: '5', c: '6' },
]


describe('table-converter', () => {
    it('tableToObject', () => {
        const obj = tableConverter.tableToObject(sampleTable)
        obj.should.be.deep.equal(sampleObj)
    })

    it('objectToTable', () => {
        const table = tableConverter.objectToTable(sampleObj)
        table.should.be.deep.equal(sampleTable)
    })
})
