require('dotenv').load()

const { CronTask } = require('cron-task')
const { createLogger } = require('logger')
const { GoogleClient, GoogleCalendarHelper } = require('google')
const { SlackClient } = require('slack')

const { SlackStatusCalendarSynchronizer } = require('./slack-status-calendar-synchronizer');


(async () => {
    const logger = createLogger()
    try {
        const client = await GoogleClient.authAndCreate({
            credentials: process.env.GOOGLE_CLIENT_CREDENTIALS,
            scope: ['https://www.googleapis.com/auth/calendar.events.readonly'],
        })
        const calendarHelper = new GoogleCalendarHelper(client, process.env.CALENDAR_ID)
        const slackClient = new SlackClient(process.env.SLACK_TOKEN)

        const synchronizer = new SlackStatusCalendarSynchronizer({
            logger,
            slackClient,
            calendarHelper,
            timezone: process.env.TIMEZONE,
        })

        const cronTask = new CronTask({
            name: 'sync-with-slack',
            cron: process.env.CRON,
        })
        cronTask.run(async () => {
            await synchronizer.sync()
        })
    } catch (e) {
        logger.error(e.stack)
    }
})()
