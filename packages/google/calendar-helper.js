module.exports.GoogleCalendarHelper = class GoogleCalendarHelper {
    constructor(client, calendarId) {
        this.client = client
        this.calendarId = calendarId
    }

    async list({ startDate, endDate, maxResults = 2500 }) {
        try {
            const params = {
                calendarId: this.calendarId,
                maxResults,
                singleEvents: true,
                orderBy: 'startTime',
                showDeleted: false,
            }
            if (startDate) params.timeMin = startDate.toISOString()
            if (endDate) params.timeMax = endDate.toISOString()

            const res = await this.client.calendar.events.list(params)
            return res.data.items
        } catch (e) {
            throw e
        }
    }

    async insert(e) {
        try {
            await this.client.calendar.events.insert({
                calendarId: this.calendarId,
                resource: e,
            })
        } catch (error) {
            throw error
        }
    }

    async update(e) {
        try {
            await this.client.calendar.events.update({
                calendarId: this.calendarId,
                eventId: e.eventId,
                resource: e,
            })
        } catch (error) {
            throw error
        }
    }

    async delete(eventId) {
        try {
            await this.client.calendar.events.delete({
                calendarId: this.calendarId,
                eventId,
            })
        } catch (error) {
            throw error
        }
    }
}
