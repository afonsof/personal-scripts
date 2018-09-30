const { createBrowser } = require('./browser')
const { interCredentials } = require('./config')
const { Inter } = require('./inter-index')

const getStatementCsv = async () => {
    const browser = await createBrowser()
    const inter = new Inter(browser, interCredentials)
    const leadTime = await inter.extractStatementCsv()
    browser.close()
    return { leadTime: { ...leadTime } }
};

(async () => {
    try {
        console.log(await getStatementCsv())
    } catch (e) {
        console.error(e)
        console.error(e.stack)
        process.exit(1)
    }
})()

module.exports = { getStatementCsv }
