const { objectToTable } = require('table-converter')
const { stringToDate, dateToString } = require('date-helper')
const { PropertiesMapper } = require('properties-mapper')

module.exports.FinanceSheet = class FinanceSheet {
    constructor(sheetsHelper) {
        this.sheetsHelper = sheetsHelper
        this.statementMapper = new PropertiesMapper({
            date: 'Data',
            description: 'Descrição',
            category: 'Categoria',
            value: 'Valor',
            account: 'Conta',
        })

        this.categoryRuleMapper = new PropertiesMapper({
            keyword: 'Palavra-chave',
            minValue: 'Valor mínimo',
            maxValue: 'Valor máximo',
            category: 'Categoria',
        })

        this.namedRanges = {
            categories: 'categories',
            categoryRules: 'categoryRules',
            accounts: 'accounts',
            statements: 'statements',
        }
    }

    async getCategories() {
        return this.sheetsHelper.getList(this.namedRanges.categories)
    }

    async getCategoryRules() {
        const data = await this.sheetsHelper.getTable(
            this.namedRanges.categoryRules, this.categoryRuleMapper,
        )
        return data.map(cr => ({
            ...cr,
            minValue: cr.minValue ? parseFloat(cr.minValue) : null,
            maxValue: cr.maxValue ? parseFloat(cr.maxValue) : null,
        }))
    }

    async getAccounts() {
        return this.sheetsHelper.getList(this.namedRanges.accounts)
    }

    async getStatement() {
        const table = await this.sheetsHelper.getTable(
            this.namedRanges.statements, this.statementMapper,
        )
        return table.map(row => ({
            ...row,
            date: stringToDate(row.date),
            value: parseFloat(row.value),
            description: row.description
                ? row.description.toUpperCase()
                : row.description,
        }))
    }

    async setStatement(data, tab) {
        const localData = data.map(row => ({
            ...row,
            date: dateToString(row.date),
            value: row.value ? parseFloat(row.value) : row.value,
            description: row.description
                ? row.description.toUpperCase()
                : row.description,
        }))
        const mapped = this.statementMapper.map(localData)
        const header = Object.values(this.statementMapper.mapData)
        const table = objectToTable(mapped, header)
        await this.sheetsHelper.setValues(tab || this.namedRanges.statements, table)
    }
}
