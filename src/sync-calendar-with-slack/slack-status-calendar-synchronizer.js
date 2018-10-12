const moment = require('moment-timezone')

module.exports.SlackStatusCalendarSynchronizer = class SlackStatusCalendarSynchronizer {
    constructor({
        calendarHelper, slackClient, logger, timezone,
    }) {
        this.calendarHelper = calendarHelper
        this.slackClient = slackClient
        this.logger = logger
        this.timezone = timezone
    }

    async sync(now) {
        const localNow = moment(now || new Date())
        const startDate = localNow.add(-1, 'day')
        const endDate = localNow.add(1, 'day')
        this.logger.info('Listing current events...')
        const events = await this.calendarHelper.list({ startDate, endDate })
        this.logger.info(`${events.length} events found.`)

        const nowEvent = events.find((e) => {
            const start = moment(e.start.dateTime)
            const end = moment(e.end.dateTime)
            return start < localNow && end > localNow
        })

        let text = 'Team Octopus'
        let emoji = ':gupytopus:'

        const nowTz = localNow.tz(this.timezone)

        if (nowEvent) {
            text = `Ocupado: ${nowEvent.summary}`
            emoji = ':calendar:'
        } else if (nowTz.hours() > 18 || nowTz.hours() < 9) {
            text = 'Away'
            emoji = ':parrotsleep:'
        } else if (nowTz.hours() === 1) {
            text = 'Almoçando'
            emoji = ':hamburger:'
        }

        this.logger.info(`Updating slack with ${emoji} - ${text}`)
        await this.slackClient.userProfileSet({
            profile: {
                status_text: text,
                status_emoji: emoji,
                status_expiration: 0,
            },
        })
        this.logger.info('Updated with success')
    }
}
