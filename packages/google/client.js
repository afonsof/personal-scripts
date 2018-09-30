const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
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

const getNewToken = async (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const code = await question(rl, 'Enter the code from that page here: ')
    const token = await oAuthGetToken(oAuth2Client, code)
    oAuth2Client.setCredentials(token)
    await fs.writeFileAsync(TOKEN_PATH, JSON.stringify(token))
    return oAuth2Client
}

const authorize = async (credentials) => {
    const oAuth2Client = new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0],
    )

    // Check if we have previously stored a token.
    try {
        const token = await fs.readFileAsync(TOKEN_PATH, 'utf-8')
        oAuth2Client.setCredentials(JSON.parse(token))
        return oAuth2Client
    } catch (e) {
        return getNewToken(oAuth2Client)
    }
}

module.exports.GoogleClient = class GoogleClient {
    constructor(auth) {
        this.spreadsheets = bluebird.promisifyAll(google.sheets({ version: 'v4', auth }).spreadsheets)
        this.spreadsheets.values = bluebird.promisifyAll(this.spreadsheets.values)
    }

    static async authAndCreate(credentials) {
        const auth = await authorize(JSON.parse(credentials))
        return new GoogleClient(auth)
    }
}
