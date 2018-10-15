const robot = require('robotjs')
const { DeviceDriverBuilderBase } = require('../device-driver-builder-base')
const { publish } = require('../publish')

const payloadEnum = {
    LOCK: 'LOCK',
}

module.exports = class MqttMacOsComputer extends DeviceDriverBuilderBase {
    constructor() {
        super({ type: 'light', driver: 'mqttMacOsComputer' })
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
                screen: client => client.publish(topics.screen, payloadEnum.LOCK),
            },

            bridge: {
                [topics.screen]: async (payload) => {
                    if (payload.toUpperCase() === payloadEnum.LOCK) {
                        const screenSize = robot.getScreenSize()
                        const { width } = screenSize

                        robot.moveMouse(width - 150, 10)
                        robot.mouseClick()
                        setTimeout(() => {
                            robot.moveMouse(width - 150, 80)
                            robot.mouseClick()
                        }, 1000)
                    }
                },
            },
        }
    }
}
