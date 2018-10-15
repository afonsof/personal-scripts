const hue = require('node-hue-api')
const { publish } = require('../publish')
const { DeviceDriverBuilderBase } = require('../device-driver-builder-base')

module.exports = class MqttHueLight extends DeviceDriverBuilderBase {
    constructor() {
        super({ type: 'light', driver: 'mqttHueLight' })
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
                powerOn: client => client.publish(topics.power, 'ON'),
                powerOff: client => client.publish(topics.power, 'OFF'),
            },

            bridge: {
                [topics.power]: async (payload) => {
                    const api = new hue.HueApi(
                        deviceSettings.driver.config('host'),
                        deviceSettings.driver.config('username'),
                    )
                    const { lightState } = hue
                    const state = lightState.create()

                    if (payload.toUpperCase() === 'ON') {
                        await api.setLightState(deviceSettings.driver.config('lightId'), state.on())
                    } else if (payload.toUpperCase() === 'OFF') {
                        await api.setLightState(deviceSettings.driver.config('lightId'), state.off())
                    }
                },
            },
        }
    }
}
