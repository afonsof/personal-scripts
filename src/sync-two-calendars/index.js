require('dotenv').load()

const { CronTask } = require('cron-task')
const { createLogger } = require('logger')
const { GoogleClient, GoogleCalendarHelper } = require('google')

const { CalendarSynchronizer } = require('./calendar-synchronizer');

(async () => {
    const logger = createLogger()
    try {
        const sourceClient = await GoogleClient.authAndCreate({
            id: 'source-client',
            credentials: process.env.GOOGLE_CLIENT_CREDENTIALS,
            scope: ['https://www.googleapis.com/auth/calendar.events.readonly'],
        })
        const destinyClient = await GoogleClient.authAndCreate({
            id: 'destiny-client',
            credentials: process.env.GOOGLE_CLIENT_CREDENTIALS,
            scope: ['https://www.googleapis.com/auth/calendar.events'],
        })
        const sourceCalendar = new GoogleCalendarHelper(sourceClient, process.env.CALENDAR_ID)
        const destinyCalendar = new GoogleCalendarHelper(destinyClient, process.env.CALENDAR_ID)
        const synchronizer = new CalendarSynchronizer({
            sourceCalendar,
            destinyCalendar,
            logger,
        })

        const cronTask = new CronTask({
            name: 'sync-two-calendars',
            cron: process.env.CRON,
        })
        cronTask.run(async () => {
            await synchronizer.sync()
        })
    } catch (e) {
        logger.error(e.stack)
    }
})()
