import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher'
import { natsWrapper } from '../nats-wrapper'

// specifique for TS
interface Payload{
	orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST
	}
})

// the job object belongs to bull, contains metadata and our Payload
expirationQueue.process(async(job) => {
	new ExpirationCompletePublisher(natsWrapper.client).publish({orderId: job.data.orderId})
})

export { expirationQueue }
