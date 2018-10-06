require('dotenv').load()

const { GoogleClient, GoogleSheetsHelper } = require('google')
const { FinanceSheet } = require('finance-sheet')
const { statementParser } = require('inter')
const { JsonDatabase, Table } = require('json-database')
const { CategoryFinder } = require('category-finder');

(async () => {
    try {
        const client = await GoogleClient.authAndCreate({
            credentials: process.env.GOOGLE_CLIENT_CREDENTIALS,
            scope: ['https://www.googleapis.com/auth/spreadsheets'],
        })
        const sheetsHelper = new GoogleSheetsHelper(client, process.env.SPREADSHEET_ID)
        const sheet = new FinanceSheet(sheetsHelper)
        const jsonDatabase = new JsonDatabase()

        const categoryRules = await sheet.getCategoryRules()
        const categoryFinder = new CategoryFinder(categoryRules)

        const categories = await sheet.getCategories()
        console.log(categories)

        const accounts = await sheet.getAccounts()
        console.log(accounts)

        const sheetData = await sheet.getStatement()

        const interDataAfonso = await statementParser.parseFromCsvFile(
            '/Users/afonsof/Downloads/Extrato (6).csv', 'Inter Afonso',
        )

        const interDataJuliana = await statementParser.parseFromCsvFile(
            '/Users/afonsof/Downloads/Extrato (7).csv', 'Inter Juliana',
        )
        const localData = await jsonDatabase.load()

        const table = new Table(categoryFinder)

        const mergedData = table
            .upsert(sheetData)
            .upsert(interDataAfonso)
            .upsert(interDataJuliana)
            .upsert(localData)
            .rows

        await sheet.setStatement(mergedData)
        await jsonDatabase.save(mergedData)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()
