const sinon = require('sinon')
const moment = require('moment')

const { FinanceSheet } = require('./finance-sheet')

let financeSheet
let fakeHelper

const fakeList = ['item1', 'item2', 'item3']

describe('finance-sheet', () => {
    beforeEach(() => {
        fakeHelper = {}
        financeSheet = new FinanceSheet(fakeHelper)
    })
    it('getAccounts', async () => {
        fakeHelper.getList = sinon.fake.returns(fakeList)
        const accounts = await financeSheet.getAccounts()
        accounts.should.be.deep.equal(fakeList)
        fakeHelper.getList.calledWith('accounts').should.be.equal(true)
    })

    it('getCategories', async () => {
        fakeHelper.getList = sinon.fake.returns(fakeList)
        const categories = await financeSheet.getCategories()
        categories.should.be.deep.equal(fakeList)
        fakeHelper.getList.calledWith('categories').should.be.equal(true)
    })

    it('getCategoryRules', async () => {
        const fakeCategoryRules = [{
            keyword: 'walmart',
            category: 'supermarket',
        }, {
            keyword: 'dennis',
            category: 'restaurant',
            minValue: '10',
            maxValue: '100',
        }]
        fakeHelper.getTable = sinon.fake.returns(fakeCategoryRules)
        const categoryRules = await financeSheet.getCategoryRules()

        fakeHelper.getTable
            .calledWith('categoryRules', financeSheet.categoryRuleMapper)
            .should.be.equal(true)

        categoryRules.should.be.deep.equal([{
            keyword: 'walmart',
            category: 'supermarket',
            minValue: null,
            maxValue: null,
        }, {
            keyword: 'dennis',
            category: 'restaurant',
            minValue: 10,
            maxValue: 100,
        }])
    })

    it('getStatement', async () => {
        const fakeCategoryRules = [{
            description: 'walmart',
            date: '2010|01|01',
            value: '123.45',
        }]
        fakeHelper.getTable = sinon.fake.returns(fakeCategoryRules)
        const categoryRules = await financeSheet.getStatement()

        fakeHelper.getTable
            .calledWith('statements', financeSheet.statementMapper)
            .should.be.equal(true)

        categoryRules.should.be.deep.equal([{
            date: moment('2010-01-01T00:00:00.000Z').toDate(),
            description: 'walmart',
            value: 123.45,
        }])
    })

    it('setStatement', async () => {
        const fakeStatement = [{
            date: moment('2010-01-01T00:00:00.000Z').toDate(),
            description: 'walmart',
            value: '123.45',
            account: 'any-account',
            category: 'any-category',
        }]

        fakeHelper.setValues = sinon.fake()
        await financeSheet.setStatement(fakeStatement)

        fakeHelper.setValues
            .calledWith('statements', [
                ['Data', 'Descrição', 'Categoria', 'Valor', 'Conta'],
                ['2010|01|01', 'walmart', 'any-category', 123.45, 'any-account'],
            ])
            .should.be.equal(true)
    })
})
