const { PropertiesMapper } = require('../properties-mapper')

const mapData = { a: 'Adamantium', u: 'Uru', v: 'Vibranium' }

const expectedUnmapped = [{
    a: 'Wolverine',
    u: 'Mjolnir',
    v: 'Cap Shield',
}]

const expectedMapped = [{
    Adamantium: 'Wolverine',
    Uru: 'Mjolnir',
    Vibranium: 'Cap Shield',
}]

describe('properties-mapper', () => {
    describe('constructor', () => {
        it('should throw an error with undefined data', () => {
            expect(() => new PropertiesMapper()).to.throw('map info is invalid')
        })

        it('should throw an error with not an object data', () => {
            expect(() => new PropertiesMapper(123)).to.throw('map is not an object')
        })

        it('should not throw an error with valid data', () => {
            expect(() => new PropertiesMapper(mapData))
                .to.not.throw('')
        })
    })
    describe('map', () => {
        it('should map', () => {
            const mapper = new PropertiesMapper(mapData)
            const mapped = mapper.map(expectedUnmapped)
            mapped.should.be.deep.equal(expectedMapped)
        })
    })
    describe('unmap', () => {
        it('should unmap', () => {
            const mapper = new PropertiesMapper(mapData)
            const mapped = mapper.unmap(expectedMapped)
            mapped.should.be.deep.equal(expectedUnmapped)
        })
    })
})
