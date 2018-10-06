require('dotenv').load()

const { GoogleClient, GoogleCalendarHelper } = require('google')
const { SlackClient } = require('slack')
const { SlackStatusCalendarSynchronizer } = require('./slack-status-calendar-synchronizer');

(async () => {
    try {
        const client = await GoogleClient.authAndCreate({
            credentials: process.env.GOOGLE_CLIENT_CREDENTIALS,
            scope: ['https://www.googleapis.com/auth/calendar.events.readonly'],
        })
        const calendarHelper = new GoogleCalendarHelper(client, process.env.CALENDAR_ID)
        const slackClient = new SlackClient(process.env.SLACK_TOKEN)

        const synchronizer = new SlackStatusCalendarSynchronizer({ slackClient, calendarHelper })
        await synchronizer.sync()
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()
