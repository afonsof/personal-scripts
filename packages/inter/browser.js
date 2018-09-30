const puppeteer = require('puppeteer')
const { browser: browserConfig } = require('./config')

class Browser {
    constructor(browser, page) {
        this.browser = browser
        this.page = page
        return this
    }

    async navigate(url) {
        await this.page.goto(url)
    }

    async fill(selector, text) {
        await this.waitForElement(selector)
        await this.page.type(selector, text)
    }

    async click(selector) {
        await this.page.click(selector)
    }

    async waitForElement(selector) {
        await this.page.waitForSelector(selector, { visible: true })
    }

    async getValueFromPage(selector) {
        await this.waitForElement(selector)
        return this.page.evaluate(s => document.querySelector(s).innerText, selector)
    }

    async getValuesFromPage(...sels) {
        const flatSelectors = [].concat(...sels)
        return Promise.all(
            flatSelectors.map(async selector => this.getValueFromPage(selector)),
        )
    }

    async close() {
        await this.browser.close()
    }
}

const launchPuppeteer = async () => {
    if (browserConfig.useSandbox) {
        return puppeteer.launch()
    }
    return puppeteer.launch({ headless: false, args: ['--no-sandbox'] })
}

const createBrowser = async () => {
    const browser = await launchPuppeteer()
    const page = await browser.newPage()
    return new Browser(browser, page)
}

module.exports.createBrowser = createBrowser
