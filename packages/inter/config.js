const interCredentials = {
    account: process.env.INTER_ACCOUNT,
    password: process.env.INTER_PASSWORD,
}

const validateInterCredentials = (credentials) => {
    const ACCOUNT_ERROR_MESSAGE = 'INTER_ACCOUNT not found. You should define a INTER_ACCOUNT environment variable.'
    const PASSWORD_ERROR_MESSAGE = 'INTER_PASSWORD not found. You should define a INTER_PASSWORD environment variable.'

    const errorMessages = []
    if (!credentials.account) errorMessages.push(ACCOUNT_ERROR_MESSAGE)
    if (!credentials.password) errorMessages.push(PASSWORD_ERROR_MESSAGE)
    if (errorMessages.length) throw new Error(errorMessages.join('\n'))
}

validateInterCredentials(interCredentials)

module.exports = {
    interCredentials,
    browser: {
        useSandbox: process.env.BROWSER_SANDBOX !== 'false',
    },
}
