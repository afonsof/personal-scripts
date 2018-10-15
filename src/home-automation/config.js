const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')

module.exports.loadConfig = () => {
    let config = {
        mqtt: {
            domain: 'default.com',
            port: 1883,
            batchTopic: 'batch/run',
        },
        devices: [],
        driverProfiles: [],
        batch: [],
    }
    const file = path.join(__dirname, 'config.yml')
    try {
        const configStr = fs.readFileSync(file, 'utf8').toString()
        config = yaml.safeLoad(configStr)
    } catch (e) {
        console.error(`Error loading config on file ${file}`)
    }
    if (!config.mqtt) {
        throw new Error('Missing key in config: mqtt')
    }
    if (!config.mqtt.domain) {
        throw new Error('Missing key in config: mqtt.domain')
    }

    return {
        ...config,
        mqtt: {
            port: 1883,
            ...config.mqtt,
        },
    }
}
