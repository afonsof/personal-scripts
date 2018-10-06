const { WebClient } = require('@slack/client')

module.exports.SlackClient = class SlackClient {
    constructor(token) {
        this.token = token
        this.client = new WebClient(token)
    }

    async userProfileSet(user) {
        await this.client.users.profile.set(user)
    }
}
