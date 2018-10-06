require('dotenv').load()

const { CronJob } = require('cron')
const { GoogleClient, GoogleCalendarHelper } = require('google')
const { CalendarSynchronizer } = require('./calendar-synchronizer')

const sync = async ({ logger }) => {
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
        await synchronizer.sync()
    } catch (e) {
        logger.error(e)
    }
}

console.log('Starting Cron Job...')
const job = new CronJob('*/10 * * * *', async () => {
    console.log('Running sync...')
    await sync({ logger: console })
    console.log('OK')
}, null, true)
console.log('OK')

job.start()
