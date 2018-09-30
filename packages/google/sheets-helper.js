const urlencode = require('urlencode')
const { tableToObject } = require('table-converter')

module.exports.GoogleSheetsHelper = class GoogleSheetsHelper {
    constructor(client, spreadsheetId) {
        this.client = client
        this.spreadsheetId = spreadsheetId
    }

    async getValues(range) {
        try {
            const res = await this.client.spreadsheets.values.getAsync({
                spreadsheetId: this.spreadsheetId,
                range: urlencode(range),
                valueRenderOption: 'UNFORMATTED_VALUE',
            })
            return res.data.values
        } catch (e) {
            if (e.cause.message.includes('Unable to parse range')) {
                return []
            }
            throw e
        }
    }

    async setValues(range, values) {
        await this.client.spreadsheets.values.clearAsync({
            spreadsheetId: this.spreadsheetId,
            range: urlencode(range),
        })

        await this.client.spreadsheets.values.updateAsync({
            spreadsheetId: this.spreadsheetId,
            range: urlencode(range),
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        })
    }

    async getList(listName) {
        const values = await this.getValues(listName)
        if (values.length) {
            return values.map(row => row[0]).slice(1)
        }
        return []
    }

    async getTable(tableName, mapper) {
        const values = await this.getValues(tableName)
        const obj = tableToObject(values)
        return mapper.unmap(obj)
    }
}
