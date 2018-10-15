module.exports.DeviceDriverBuilderBase = class DeviceDriverBuilderBase {
    constructor({ type, driver }) {
        if (!type) throw new Error('Device Driver Builder must have type param')
        if (!driver) throw new Error('Device Driver Builder must have driver param')
        this.type = type
        this.driver = driver
    }

    static build() {
        throw new Error('Not implemented')
    }
}
