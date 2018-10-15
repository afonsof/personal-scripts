// @flow
const { DeviceDriverBuilderBase } = require('../device-driver-builder-base')
const { publish } = require('../publish')

module.exports = class MqttLight extends DeviceDriverBuilderBase {
    constructor() {
        super({ type: 'light', driver: 'mqttLight' })
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
        }
    }
}
