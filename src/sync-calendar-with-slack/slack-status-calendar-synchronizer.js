const moment = require('moment')
const momentTz = require('moment-timezone')

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
        const localNow = now || new Date()
        const startDate = moment(localNow).add(-1, 'day').toDate()
        const endDate = moment(localNow).add(1, 'day').toDate()
        this.logger.info('Listing current events...')
        const events = await this.calendarHelper.list({
            startDate,
            endDate,
        })
        this.logger.info(`${events.length} events found.`)

        const nowEvent = events.find((e) => {
            const start = moment(e.start.dateTime)
            const end = moment(e.end.dateTime)
            return start < localNow && end > localNow
        })

        let text = 'Team Octopus'
        let emoji = ':gupytopus:'

        const nowTz = momentTz(localNow).tz(this.timezone)
        let snooze = false

        if (nowEvent) {
            const eventLower = nowEvent.summary.toLowerCase()
            if (eventLower.includes('almoç')
                || eventLower.includes('lunch')
                || eventLower.includes('dinner')
                || eventLower.includes('janta')
            ) {
                text = nowEvent.summary.replace(/🍔/g, '')
                emoji = ':hamburger:'
                snooze = true
            } else {
                text = `Ocupado: ${nowEvent.summary}`
                emoji = ':calendar:'
            }
        } else if (nowTz.hours() > 18 || nowTz.hours() < 9) {
            text = 'Away'
            emoji = ':parrotsleep:'
            snooze = true
        }

        this.logger.info(`Updating slack profile with ${emoji} - ${text}...`)
        await this.slackClient.userProfileSet({
            profile: {
                status_text: text,
                status_emoji: emoji,
                status_expiration: 0,
            },
        })
        this.logger.info('Updated slack profile with success')

        if (snooze) {
            this.logger.info('Time to snooze...')
            await this.slackClient.startSnooze()
        } else {
            this.logger.info('Time to wake up..')
            await this.slackClient.endSnooze()
        }
        this.logger.info('Updated slack snooze data with success')
    }
}
