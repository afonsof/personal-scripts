const wol = require('wake_on_lan')
const lgtv = require('lgtv2')
const { DeviceDriverBuilderBase } = require('../device-driver-builder-base')
const { publish } = require('../publish')

const buildLgTvUri = command => `ssap://${command}`

const lgTvCommand = async (host, command, payload = null) => new Promise((resolve, reject) => {
    const timeout = payload === 'ssap://system/turnOff' ? 1000 : 15000
    const lgtvClient = lgtv({
        url: `ws://${host}:3000`,
        timeout,
    })

    lgtvClient.on('error', err => reject(err))

    lgtvClient.on('connect', () => {
        lgtvClient.request(command, payload, (err, res) => {
            lgtvClient.disconnect()
            if (err) return reject(err)
            return resolve(res)
        })
    })
})

const wolCommand = macAddress => new Promise((resolve, reject) => {
    wol.wake(macAddress, (err) => {
        if (err) return reject(err)
        return resolve({ message: 'TV Turned on' })
    })
})


module.exports = class MqttLgMediaPlayer extends DeviceDriverBuilderBase {
    constructor() {
        super({ type: 'mediaPlayer', driver: 'mqttLgMediaPlayer' })
    }

    // eslint-disable-next-line class-methods-use-this
    build(deviceSettings) {
        const { topics } = deviceSettings

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            topics: Object.values(topics),
            location: 'todo',

            methods: {
                powerOn: async client => client.publish(topics.power, 'ON'),
                powerOff: async client => client.publish(topics.power, 'OFF'),
                setVolume: async (client, volume) => client.publish(
                    topics.setVolume, volume.toString(),
                ),
                setSource: async (client, source) => client.publish(
                    topics.setSource, source,
                ),
            },

            bridge: {
                [topics.power]: async (payload) => {
                    if (payload.toLowerCase() === 'off') {
                        const uri = buildLgTvUri('system/turnOff')
                        await lgTvCommand(deviceSettings.driver.config('host'), uri)
                        return { message: 'TV Turned off' }
                    }
                    if (payload.toLowerCase() === 'on') {
                        await wolCommand(deviceSettings.driver.config('macAddress'))
                        return { message: 'TV Turned on' }
                    }
                    return { message: 'Invalid command' }
                },

                [topics.setSource]: async (payload) => {
                    const uri = buildLgTvUri('system.launcher/launch')
                    await lgTvCommand(deviceSettings.driver.config('host'), uri, { id: payload.toLowerCase() })
                    return { message: `TV Source changed to ${payload}` }
                },

                [topics.setVolume]: async (payload) => {
                    const uri = buildLgTvUri('audio/setVolume')
                    await lgTvCommand(deviceSettings.driver.config('host'), uri, { volume: parseInt(payload, 10) })
                    return { message: `TV Volume changed to ${payload}` }
                },
            },
        }
    }
}
