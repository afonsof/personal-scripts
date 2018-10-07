const { CronJob } = require('cron')
const prettyCron = require('prettycron')
const { createLogger } = require('logger')

module.exports.CronTask = class CronTask {
    constructor({
        name,
        cron = '*/10 * * * *',
        logger = createLogger(),
    }) {
        this.name = name
        this.cron = cron
        this.logger = logger
    }

    run(fn) {
        const job = new CronJob(this.cron, async () => {
            this.logger.info(`Running Cron Task ${this.name}...`)
            await fn({ logger: this.logger })
            this.logger.info('Ran with success!')
            this.logger.info(`Next time it will run: ${prettyCron.getNext(this.cron).toLowerCase()}`)
        }, null, true)
        job.start()
        this.logger.info(`Started Cron Task ${this.name}...`)
        this.logger.info(`It will run ${prettyCron.toString(this.cron).toLowerCase()}`)
    }
}
