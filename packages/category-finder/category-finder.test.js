const { CategoryFinder } = require('./category-finder')


const categoryRules = [{
    keyword: 'walmart',
    category: 'supermarket',
}, {
    keyword: 'dennis',
    category: 'restaurant',
    minValue: 10,
}, {
    keyword: 'toys',
    category: 'gift',
    maxValue: 100,
}]

describe('category-finder', () => {
    describe('constructor', () => {
        it('should throw an error if called with invalid data', () => {
            expect(() => new CategoryFinder()).to.throw('categoryRules must be an array')
            expect(() => new CategoryFinder(123)).to.throw('categoryRules must be an array')
        })
    })
    describe('findByStatementLine', () => {
        it('should be invalid using a invalid description', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'invalid',
            })
            should.not.exist(category)
        })
        it('should be valid using a keyword', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'walmart center',
            })
            category.should.be.equal('supermarket')
        })
        it('should return null if matches keyword but not minValue', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'dennis',
                value: 9,
            })
            should.not.exist(category)
        })
        it('should return null if matches keyword but not maxValue', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'toys R us',
                value: 299,
            })
            should.not.exist(category)
        })

        it('should return null if matches keyword and minValue', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'dennis',
                value: 30,
            })
            category.should.be.equal('restaurant')
        })

        it('should return null if matches keyword and maxValue', () => {
            const finder = new CategoryFinder(categoryRules)
            const category = finder.findByStatementLine({
                description: 'toys R us',
                value: 55,
            })
            category.should.be.equal('gift')
        })
    })
})
