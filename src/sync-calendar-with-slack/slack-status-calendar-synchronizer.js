const moment = require('moment')

module.exports.SlackStatusCalendarSynchronizer = class SlackStatusCalendarSynchronizer {
    constructor({ calendarHelper, slackClient }) {
        this.calendarHelper = calendarHelper
        this.slackClient = slackClient
    }

    async sync(now) {
        const localNow = now || new Date()
        const startDate = moment(localNow).add(-1, 'day').toDate()
        const events = await this.calendarHelper.list(startDate)

        const nowEvent = events.find((e) => {
            const start = moment(e.start.dateTime).toDate()
            const end = moment(e.end.dateTime).toDate()
            return start < localNow && end > localNow
        })

        let text = 'Team Octopus'
        let emoji = ':gupytopus:'

        if (nowEvent) {
            text = `Ocupado: ${nowEvent.summary}`
            emoji = ':calendar:'
        } else if (localNow.getHours() > 18 || localNow.getHours() < 9) {
            text = 'Away'
            emoji = ':parrotsleep:'
        } else if (localNow.getHours() === 1) {
            text = 'Almoçando'
            emoji = ':hamburger:'
        }

        await this.slackClient.userProfileSet({
            profile: {
                status_text: text,
                status_emoji: emoji,
                status_expiration: 0,
            },
        })
    }
}
