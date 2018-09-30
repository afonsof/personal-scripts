module.exports.tableToObject = (table) => {
    const header = table.slice(0, 1)[0]
    const rows = table.slice(1)
    return rows.map(r => r.reduce((prev, c, index) => ({ ...prev, [header[index]]: c }), {}))
}

module.exports.objectToTable = (obj, header) => {
    const localHeader = header || Object.keys(obj.reduce((prev, i) => ({ ...i }), {}))
    return [localHeader, ...obj.map(i => localHeader.map(h => i[h]))]
}
