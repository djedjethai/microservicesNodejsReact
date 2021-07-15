import { Listener, Subjects, OrderCreatedEvent } from '@microticketing/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated 
	queueGroupName = queueGroupName 

	async onMessage(data: OrderCreatedEvent['data'], msg: Message){
		// get time on ms for the delay
		// the data.expireAt as been setup in order/routes/news.js  
		const delay = new Date(data.expireAt).getTime() - new Date().getTime()
		console.log('waiting delay: ', delay)

		await expirationQueue.add({
			orderId: data.id
		}, {
			delay: delay
		})

		msg.ack()
	}
	
}
