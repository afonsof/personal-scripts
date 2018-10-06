const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const TOKEN_PATH = 'token.json'

const oAuthGetToken = async (client, code) => new Promise((resolve, reject) => {
    client.getToken(code, (err, token) => {
        if (err) return reject(new Error(`Error while trying to retrieve access token${JSON.stringify(err)}`))
        return resolve(token)
    })
})

const question = async (rl, text) => new Promise(resolve => rl.question(text, (code) => {
    rl.close()
    resolve(code)
}))

const getNewToken = async ({
    id, oAuth2Client, scope, tokens,
}) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const code = await question(rl, 'Enter the code from that page here: ')
    const token = await oAuthGetToken(oAuth2Client, code)
    const localTokens = { ...tokens, [id]: token }
    oAuth2Client.setCredentials(token)
    await fs.writeFileAsync(TOKEN_PATH, JSON.stringify(localTokens))
    return oAuth2Client
}

const authorize = async ({ id, credentials, scope }) => {
    const oAuth2Client = new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0],
    )

    let tokens
    try {
        tokens = JSON.parse(await fs.readFileAsync(TOKEN_PATH, 'utf-8'))
    } catch (e) {
        tokens = {}
    }
    if (tokens[id]) {
        oAuth2Client.setCredentials(tokens[id])
        return oAuth2Client
    }
    return getNewToken({
        id, oAuth2Client, scope, tokens,
    })
}

module.exports.GoogleClient = class GoogleClient {
    constructor(auth) {
        this.spreadsheets = bluebird.promisifyAll(google.sheets({ version: 'v4', auth }).spreadsheets)
        this.spreadsheets.values = bluebird.promisifyAll(this.spreadsheets.values)
        this.calendar = google.calendar({ version: 'v3', auth })
    }

    static async authAndCreate({ id, credentials, scope }) {
        const localId = id || 'google-client'
        const auth = await authorize({
            id: localId,
            credentials: JSON.parse(credentials),
            scope,
        })
        return new GoogleClient(auth)
    }
}
