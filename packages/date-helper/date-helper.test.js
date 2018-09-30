const moment = require('moment')
const dateHelper = require('./date-helper')


describe('date-helper', () => {
    it('stringToDate', () => {
        const date = dateHelper.stringToDate('2010|01|01')
        date.should.be.deep.equal(moment('2010-01-01T00:00:00+00:00').toDate())
    })

    it('dateToString', () => {
        const string = dateHelper.dateToString(
            moment('2010-01-01T00:00:00+00:00').toDate(),
        )
        string.should.be.equal('2010|01|01')
    })
})
