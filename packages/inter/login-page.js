const LOGIN_PAGE_URL = 'https://internetbanking.bancointer.com.br/login.jsf'
const selectors = {
    accountField: '#loginv20170605',
    loginButton: '#login-submit',
    passwordField: '#password',
}

async function asyncForEach(array, callback) {
    const results = []
    for (let index = 0; index < array.length; index += 1) {
        results.push(callback(array[index], index, array))
    }
    return Promise.all(results)
}

const signIn = async (browser, credentials) => {
    await browser.navigate(LOGIN_PAGE_URL)

    await browser.fill(selectors.accountField, credentials.account)

    const btn = await browser.page.$('[type=submit]')
    await btn.click()
    await browser.page.waitForNavigation({ waitUntil: 'networkidle2' })

    // const name = await browser.page.$('#j_idt139');
    const name = await browser.page.$x('//a[contains(text(),"AFO")]')
    await name[0].click()


    await asyncForEach(['▲', 'A', '▲', 'f', '7', '2', '4', '4', '5', '2'], async (letter) => {
        await browser.page.waitFor(1000)
        const upper = await browser.page.$(`input[title="${letter}"]`)
        await upper.click()
    })

    const confirmButton = await browser.page.$('[value="CONFIRMAR"]')
    await confirmButton.click()

    /* await browser.click(selectors.loginButton);
    await browser.fill(selectors.passwordField, credentials.password);
    await browser.click(selectors.loginButton);
    await browser.waitForElement('#jira'); */
}

module.exports = { signIn }
