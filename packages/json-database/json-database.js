const bluebird = require('bluebird')
const md5 = require('md5')
const fs = bluebird.promisifyAll(require('fs'))

module.exports.JsonDatabase = class JsonDatabase {
    constructor() {
        this.fileName = 'data/local-data.json'
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

module.exports.normalizeDescription = (description) => {
    let localDescription = description ? description.toUpperCase() : ''
    localDescription = localDescription.replace(/[^\w\s]/gi, '')
    const items = localDescription.trim().split(' ').filter(w => !!w && w !== '-')
    if (items[items.length - 1].length < 3) {
        items.pop()
    }
    return items.join(' ')
}

module.exports.Table = class Table {
    constructor(categoryFinder) {
        this.data = {}
        this.categoryFinder = categoryFinder
    }

    upsert(rows) {
        rows.forEach((line) => {
            const localLine = {
                ...line,
                description: module.exports.normalizeDescription(line.description),
                category: line.category || this.categoryFinder.findByStatementLine(line),
            }

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
        return this
    }

    get rows() {
        return Object
            .values(this.data)
            .sort((d1, d2) => d1.date - d2.date)
    }
}
