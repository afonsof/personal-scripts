const sinon = require('sinon')
const moment = require('moment')

const { SlackStatusCalendarSynchronizer } = require('./slack-status-calendar-synchronizer')

const fakeCalendarHelper = {}
const fakeSlackClient = {}
let synchronizer

const testLunchWithPhrase = async (phrase, expected) => {
    fakeCalendarHelper.list = sinon.fake.returns([{
        start: {
            dateTime: '2010-01-01 14:30:00',
        },
        end: {
            dateTime: '2010-01-01 15:30:00',
        },
        summary: phrase,
    }])

    const startDate = moment('2010-01-01 15:00:00').toDate()
    await synchronizer.sync(startDate)
    fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
        profile: {
            status_emoji: ':hamburger:',
            status_expiration: 0,
            status_text: expected,
        },
    }]])
    fakeSlackClient.startSnooze.called.should.be.equal(true)
    fakeSlackClient.endSnooze.called.should.be.equal(false)
}

describe('slack-status-calendar-synchronizer', () => {
    beforeEach(() => {
        synchronizer = new SlackStatusCalendarSynchronizer({
            slackClient: fakeSlackClient,
            calendarHelper: fakeCalendarHelper,
            logger: console,
            timezone: 'America/Sao_Paulo',
        })
        fakeSlackClient.userProfileSet = sinon.fake()
        fakeSlackClient.startSnooze = sinon.fake()
        fakeSlackClient.endSnooze = sinon.fake()
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
            fakeSlackClient.startSnooze.called.should.be.equal(true)
            fakeSlackClient.endSnooze.called.should.be.equal(false)
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
            fakeSlackClient.startSnooze.called.should.be.equal(true)
            fakeSlackClient.endSnooze.called.should.be.equal(false)
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
            fakeSlackClient.startSnooze.called.should.be.equal(false)
            fakeSlackClient.endSnooze.called.should.be.equal(true)
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
            fakeSlackClient.startSnooze.called.should.be.equal(false)
            fakeSlackClient.endSnooze.called.should.be.equal(true)
        })

        it('set profile event when there is an event', async () => {
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
            fakeSlackClient.startSnooze.called.should.be.equal(false)
            fakeSlackClient.endSnooze.called.should.be.equal(true)
        })

        it('set profile lunch when there is a lunch event case 1', async () => {
            await testLunchWithPhrase('lunch', 'lunch')
        })

        it('set profile lunch when there is a lunch event case 2', async () => {
            await testLunchWithPhrase('almoço', 'almoço')
        })

        it('set profile lunch when there is a lunch event case 3', async () => {
            await testLunchWithPhrase('almoçar', 'almoçar')
        })

        it('set profile lunch when there is a lunch event case 4', async () => {
            await testLunchWithPhrase('dinner', 'dinner')
        })

        it('set profile lunch when there is a lunch event case 5', async () => {
            await testLunchWithPhrase('jantar romântico', 'jantar romântico')
        })

        it('set profile lunch when there is a lunch event case 6', async () => {
            await testLunchWithPhrase('janta', 'janta')
        })

        it('set profile lunch when there is a lunch event case 7', async () => {
            await testLunchWithPhrase(
                '🍔🍔🍔lunch with emojis🍔🍔🍔',
                'lunch with emojis',
            )
        })

        it('set profile octopus when there is no event and is not night when server timezone is wrong', async () => {
            fakeCalendarHelper.list = sinon.fake.returns([])

            const startDate = moment('2010-01-01T20:00:00+00:00').toDate()
            await synchronizer.sync(startDate)
            fakeSlackClient.userProfileSet.args.should.be.deep.equal([[{
                profile: {
                    status_emoji: ':gupytopus:',
                    status_expiration: 0,
                    status_text: 'Team Octopus',
                },
            }]])
            fakeSlackClient.startSnooze.called.should.be.equal(false)
            fakeSlackClient.endSnooze.called.should.be.equal(true)
        })
    })
})
