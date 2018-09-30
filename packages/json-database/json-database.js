const bluebird = require('bluebird')
const md5 = require('md5')
const fs = bluebird.promisifyAll(require('fs'))

module.exports.JsonDatabase = class JsonDatabase {
    constructor() {
        this.fileName = '../local-data.json'
    }

    async load() {
        let content

        try {
            content = await fs.readFileAsync(this.fileName)
        } catch (e) {
            content = '[]'
        }
        const data = JSON.parse(content)
        return data.map(d => ({
            ...d,
            date: new Date(d.date),
        }))
    }

    async save(data) {
        const content = JSON.stringify(data)
        await fs.writeFileAsync(this.fileName, content)
    }
}

module.exports.Table = class Table {
    constructor() {
        this.data = {}
    }

    upsert(rows) {
        rows.forEach((line) => {
            const localLine = { ...line }
            if (!localLine.id) {
                // eslint-disable-next-line no-param-reassign
                localLine.id = md5(`${line.date}-${line.value}-${line.description}`)
            }
            const savedLine = this.data[localLine.id]
            if (savedLine) {
                Object.keys({ ...localLine, ...savedLine }).forEach((key) => {
                    if (savedLine[key] && localLine[key] !== savedLine[key]) {
                        localLine[key] = savedLine[key]
                    }
                })
            }
            this.data[localLine.id] = localLine
        })
    }

    get rows() {
        return Object
            .values(this.data)
            .sort((d1, d2) => d1.date - d2.date)
    }
}
