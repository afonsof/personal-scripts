module.exports.CategoryFinder = class CategoryFinder {
    constructor(categoryRules) {
        if (!categoryRules || !Array.isArray(categoryRules)) throw new Error('categoryRules must be an array')
        this.keywordToCategory = {}
        categoryRules.forEach((cr) => {
            this.keywordToCategory[cr.keyword.toUpperCase()] = {
                category: cr.category,
                minValue: cr.minValue,
                maxValue: cr.maxValue,
            }
        })
    }

    findByStatementLine(statementLine) {
        const keywords = Object
            .keys(this.keywordToCategory)
            .filter(c => statementLine.description.toUpperCase().includes(c))

        const filteredKw = keywords.find((k) => {
            const data = this.keywordToCategory[k]
            return (!data.minValue || statementLine.value >= data.minValue)
             && (!data.maxValue || statementLine.value <= data.maxValue)
        })

        if (filteredKw) {
            return this.keywordToCategory[filteredKw].category
        }
        console.log(`Category not found: ${JSON.stringify(statementLine)}`)
        return null
    }
}
