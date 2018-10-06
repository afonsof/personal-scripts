const sinon = require('sinon')
const moment = require('moment')

const { SlackStatusCalendarSynchronizer } = require('./slack-status-calendar-synchronizer')

const fakeCalendarHelper = {}
const fakeSlackClient = {}
let synchronizer

describe('slack-status-calendar-synchronizer', () => {
    beforeEach(() => {
        synchronizer = new SlackStatusCalendarSynchronizer({
            slackClient: fakeSlackClient,
            calendarHelper: fakeCalendarHelper,
        })
        fakeSlackClient.userProfileSet = sinon.fake()
    })
    describe('sync', () => {
        it('set profile sleep when there is no event and is at night', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([])

            const startDate = moment('2010-01-01 19:00:00').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':parrotsleep:',
                    status_expiration: 0,
                    status_text: 'Away',
                },
            }]])
        })

        it('set profile sleep when there is no event and is at morning', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([])

            const startDate = moment('2010-01-01 08:59:59').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':parrotsleep:',
                    status_expiration: 0,
                    status_text: 'Away',
                },
            }]])
        })

        it('set profile octopus when there is no event and is start work', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([])

            const startDate = moment('2010-01-01 09:00:00').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':gupytopus:',
                    status_expiration: 0,
                    status_text: 'Team Octopus',
                },
            }]])
        })

        it('set profile octopus when there is no event and is almost end work', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([])

            const startDate = moment('2010-01-01 18:59:59').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':gupytopus:',
                    status_expiration: 0,
                    status_text: 'Team Octopus',
                },
            }]])
        })

        it('set profile event when there is a event', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([{
                start: {
                    dateTime: '2010-01-01 14:30:00',
                },
                end: {
                    dateTime: '2010-01-01 15:30:00',
                },
                summary: 'any-event-summary',
            }])

            const startDate = moment('2010-01-01 15:00:00').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':calendar:',
                    status_expiration: 0,
                    status_text: 'Ocupado: any-event-summary',
                },
            }]])
        })
    })
})
