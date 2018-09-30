const { extractStatementCsv } = require('./statement-page')
const { signIn } = require('./login-page')

class Inter {
    constructor(browser, credentials) {
        this.browser = browser
        this.credentials = credentials
    }

    async extractStatementCsv() {
        await signIn(this.browser, this.credentials)
        return extractStatementCsv(this.browser)
    }
}

module.exports = { Inter }
