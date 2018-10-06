const moment = require('moment')
const bluebird = require('bluebird')

module.exports.CalendarSynchronizer = class CalendarSynchronizer {
    constructor({ sourceCalendar, destinyCalendar, logger }) {
        this.sourceCalendar = sourceCalendar
        this.destinyCalendar = destinyCalendar
        this.logger = logger
    }

    // private
    static mustUpdateEvent(original, candidate) {
        return JSON.stringify(original.start) !== JSON.stringify(candidate.start)
            || JSON.stringify(original.end) !== JSON.stringify(candidate.end)
            || original.summary !== candidate.summary
            || original.kind !== candidate.kind
            || original.status !== candidate.status
            || original.location !== candidate.location
    }

    static mountEvent(description, e) {
        return {
            description,
            start: e.start,
            summary: e.summary,
            kind: e.kind,
            end: e.end,
            status: e.status,
            location: e.location,
        }
    }

    async sync(now) {
        const startDate = moment(now).add(-7, 'day').toDate()
        const endDate = moment(now).add(7 * 8, 'day').toDate()
        const sourceEvents = await this.sourceCalendar.list(startDate, endDate)

        const destinyEvents = await this.destinyCalendar.list(startDate, endDate)

        const eventsToInsert = []
        const eventsToUpdate = []

        const filteredEvents = sourceEvents.filter(
            e => !e.summary.toLowerCase().includes('aniversário'),
        )

        filteredEvents.forEach((e) => {
            const originalId = `original-id:${e.id}`
            const description = `${e.description || ''}\n${originalId}`
            const targetEvent = destinyEvents.find(
                de => de.description && de.description.includes(originalId),
            )
            if (!targetEvent) {
                eventsToInsert.push(CalendarSynchronizer.mountEvent(description, e))
            } else if (description !== targetEvent.description
                || CalendarSynchronizer.mustUpdateEvent(e, targetEvent)
            ) {
                eventsToUpdate.push({
                    ...CalendarSynchronizer.mountEvent(description, e),
                    eventId: targetEvent.id,
                })
            }
        })
        const eventsToDelete = destinyEvents.filter((e) => {
            const match = /original-id:([\w_]+)/.exec(e.description)
            if (match) {
                const originalId = match[1]
                const found = filteredEvents.find(fe => fe.id === originalId)
                return !found
            }
            return false
        })

        await bluebird.each(eventsToInsert, async (e) => {
            await this.destinyCalendar.insert(e)
        })
        this.logger.log(`${eventsToInsert.length} events inserted.`)
        await bluebird.each(eventsToUpdate, async (e) => {
            await this.destinyCalendar.update(e)
        })
        this.logger.log(`${eventsToUpdate.length} events updated.`)
        await bluebird.each(eventsToDelete, async (e) => {
            await this.destinyCalendar.delete(e.id)
        })
        this.logger.log(`${eventsToDelete.length} events deleted.`)
    }
}
