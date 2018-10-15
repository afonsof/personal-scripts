const mqtt = require('mqtt')
const configFn = require('./config')
const { DeviceListFactory } = require('./device-list-factory')

const config = configFn()

const startClient = async (localConfig, location) => {
    const devices = await DeviceListFactory.create(localConfig)
    const locationDevices = devices.filter(d => d.location === location)

    const client = mqtt.connect(
        `mqtt://${localConfig.mqtt.domain}:${localConfig.mqtt.port}`,
    )

    client.on('connect', () => {
        const bridgedDevices = locationDevices
            .filter(d => d.bridge)
        console.log(`${bridgedDevices.length} bridged devices`)

        bridgedDevices.forEach((device) => {
            device.topics.forEach((topic) => {
                client.subscribe(topic)
                console.log(`Subscribed to topic ${topic}`)
            })
        })
    })

    client.on('message', async (topic, payload) => {
        const strPayload = payload.toString()
        const device = locationDevices.find(d => d.topics.includes(topic))
        if (device) {
            if (device.bridge) {
                const res = await device.bridge[topic](strPayload)
                console.log(res)
            }
        }
    })
};

(async () => {
    try {
        await startClient(config, 'todo')
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()
