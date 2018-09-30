const { zip } = require('zip-array')

const leadTimeSelector = {
    mean: '.js-chart-snapshot-mean',
    median: '.js-chart-snapshot-median',
    max: '.js-chart-snapshot-max-time',
    min: '.js-chart-snapshot-min-time',
}

const CONTROL_CHART_URL = 'https://gupy-io.atlassian.net/secure/RapidBoard.jspa?projectKey=CAND&rapidView=28&view=reporting&chart=controlChart&days=30'

const objectify = (obj, [k, v]) => ({ ...obj, [k]: v })

const extractStatementCsv = async (browser) => {
    await browser.navigate(CONTROL_CHART_URL)
    const leadTimeSelectors = Object.values(leadTimeSelector)
    const values = await browser.getValuesFromPage(leadTimeSelectors)
    return zip(Object.keys(leadTimeSelector), values).reduce(objectify, {})
}

module.exports = { extractStatementCsv }
