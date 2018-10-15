const mosca = require('mosca')
const mqtt = require('mqtt')

const httpBridge = require('./http-bridge')
const { BatchRunner } = require('./batch-runner')
const { loadConfig } = require('./config')
const { DeviceListFactory } = require('./device-list-factory')

const config = loadConfig();

(async () => {
    try {
        const devices = await DeviceListFactory.create(config)
        const batchRunner = await BatchRunner.create(config, devices)

        const mqttServer = new mosca.Server({ port: config.mqtt.port })

        mqttServer.on('clientConnected', client => console.log('client connected', client.id))

        mqttServer.on('published', (packet) => {
            console.log('=========')
            console.log('Topic:', packet.topic)
            console.log('Payload:', packet.payload.toString())
        })

        mqttServer.on('ready', async () => {
            console.log('MQTT server is running')

            const client = mqtt.connect('mqtt://127.0.0.1')

            client.on('connect', () => client.subscribe(config.mqtt.batchTopic))

            client.on('message', (topic, payload) => {
                if (topic === 'batch/run') {
                    try {
                        batchRunner.run(client, payload)
                    } catch (err) {
                        console.log(err)
                    }
                }
            })

            await httpBridge.start(mqttServer)
            console.log('HTTP Bridge Server is running')
        })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()
