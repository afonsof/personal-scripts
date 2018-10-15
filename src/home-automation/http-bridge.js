const express = require('express')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')

const actionSync = requestId => ({
    requestId,
    payload: {
        agentUserId: '1836.15267389',
        devices: [{
            id: '123',
            type: 'action.devices.types.OUTLET',
            traits: [
                'action.devices.traits.OnOff',
            ],
            name: {
                defaultNames: ['My Outlet 1234'],
                name: 'Night light',
                nicknames: ['wall plug'],
            },
            willReportState: false,
            roomHint: 'kitchen',
            deviceInfo: {
                manufacturer: 'lights-out-inc',
                model: 'hs1234',
                hwVersion: '3.2',
                swVersion: '11.4',
            },
            customData: {
                fooValue: 74,
                barValue: true,
                bazValue: 'foo',
            },
        }, {
            id: '456',
            type: 'action.devices.types.LIGHT',
            traits: [
                'action.devices.traits.OnOff', 'action.devices.traits.Brightness',
                'action.devices.traits.ColorTemperature',
                'action.devices.traits.ColorSpectrum',
            ],
            name: {
                defaultNames: ['lights out inc. bulb A19 color hyperglow'],
                name: 'lamp1',
                nicknames: ['reading lamp'],
            },
            willReportState: false,
            roomHint: 'office',
            attributes: {
                temperatureMinK: 2000,
                temperatureMaxK: 6500,
            },
            deviceInfo: {
                manufacturer: 'lights out inc.',
                model: 'hg11',
                hwVersion: '1.2',
                swVersion: '5.4',
            },
            customData: {
                fooValue: 12,
                barValue: false,
                bazValue: 'bar',
            },
        }],
    },
})

module.exports = {
    start: async (mqttServer) => {
        const url = await ngrok.connect(3000)
        console.log(url)
        return new Promise((resolve, reject) => {
            const app = express()
            app.use(bodyParser.json())

            app.use((req, res, next) => {
                console.log(`${req.method} ${req.url}`)
                // console.log(req.body) // populated!
                next()
            })

            app.post('/publish', (req, res) => {
                const message = {
                    topic: req.body.topic
                        .toLowerCase()
                        .replace('.the ', '. ')
                        .replace(' the ', ' ')
                        .replace(' the.', ' .')
                        .replace(/\s/g, ''),
                    payload: req.body.message, // or a Buffer
                    qos: 2, // 0, 1, or 2
                    retain: false, // or true
                }
                console.log('http call:')
                console.log(JSON.stringify(message))

                mqttServer.publish(message, () => res.status(200).send(JSON.stringify(message)))
            })

            app.post('/google-action', (req, res) => {
                const action = (
                    req.body
                    && req.body.inputs
                    && req.body.inputs.length
                    && req.body.inputs[0].intent
                ) ? req.body.inputs[0].intent : null
                if (action === 'action.devices.SYNC') {
                    return res.status(200).send(actionSync(req.body.requestId))
                }
                res.status(400).send({})
            })

            app.listen(3000, (err) => {
                if (err) return reject(err)
                return resolve()
            })
        })
    },
}
