const transpose = (data, transposeData) => data
    .map(row => Object.keys(row).reduce((prev, c, index) => {
        const key = transposeData[Object.keys(row)[index]]
        if (!key) return prev

        return {
            ...prev,
            [key]: row[c],
        }
    }, {}))

module.exports.PropertiesMapper = class PropertiesMapper {
    constructor(map) {
        if (!map) throw new Error('map info is invalid')
        if (typeof map !== 'object') throw new Error('map is not an object')

        this.mapData = map
        this.unmapData = Object.entries(map).reduce((prev, cur) => ({
            ...prev,
            [cur[1]]: cur[0],
        }), {})
    }

    // private

    map(list) {
        return transpose(list, this.mapData)
    }

    unmap(list) {
        return transpose(list, this.unmapData)
    }
}
