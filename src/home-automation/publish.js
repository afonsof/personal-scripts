module.exports.publish = async (
    client, topic, payload, options,
) => new Promise((resolve, reject) => {
    client.publish(topic, payload, options, (err) => {
        if (err) {
            return reject(err)
        }
        return resolve()
    })
})
