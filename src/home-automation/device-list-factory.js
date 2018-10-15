const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const path = require('path')
const { commands } = require('./device-types')

const deviceTypes = {
    light: 'light',
    mediaPlayer: 'mediaPlayer',
    computer: 'computer',
}


const loadDevicesDrivers = async () => {
    const folder = path.join(__dirname, 'device-drivers')
    const files = await fs.readdirAsync(folder)
    return files.map((file) => {
        const filePath = path.join(folder, file)
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const DeviceClass = require(filePath)
        return new DeviceClass()
    })
}

module.exports.DeviceListFactory = class DeviceListFactory {
    static async create(config) {
        const devicesDrivers = await loadDevicesDrivers()

        const devices = config.devices.map((device) => {
            const localDevice = { ...device }
            if (localDevice.driver && localDevice.driver.profile) {
                const profile = config.driverProfiles
                    .filter(p => p.id === localDevice.driver.profile)[0]
                const cleanProfile = { ...profile }
                delete cleanProfile.id
                localDevice.driver = { ...localDevice.driver, ...cleanProfile }
            }
            const driver = devicesDrivers.find(
                d => d.type === localDevice.type && d.driver === localDevice.driver.id,
            )
            if (driver) {
                return driver.build(localDevice, config)
            }
            return {
                type: 'light',
                deviceId: '123',
                methods: {},
                topics: [],
                location: '',
            }
        })

        Object.keys(deviceTypes).forEach((key) => {
            const commands1 = commands[key]
            const item = {
                type: key,
                deviceId: `all-${key}s`,
                methods: {},
                topics: [],
                location: '',
            }
            commands1.forEach((command) => {
                const filteredDevices = devices
                    .filter(device => device.type === key)
                item.methods[command] = async (client) => {
                    const promises = filteredDevices
                        .map(device => device.methods[command](client))
                    return Promise.all(promises)
                }
            })
            devices.push(item)
        })
        return devices
    }
}
