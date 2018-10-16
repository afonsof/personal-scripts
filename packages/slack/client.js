const { WebClient } = require('@slack/client')

module.exports.SlackClient = class SlackClient {
    constructor(token) {
        this.token = token
        this.client = new WebClient(token)
    }

    async userProfileSet(user) {
        await this.client.users.profile.set(user)
    }

    async startSnooze() {
        await this.client.dnd.setSnooze({
            num_minutes: 60,
        })
    }

    async endSnooze() {
        await this.client.dnd.endSnooze()
    }
}
