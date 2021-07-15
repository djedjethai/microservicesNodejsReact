import { Message } from 'node-nats-streaming'
import { Subjects, OrderStatus, Listener, ExpirationCompleteEvent } from '@microticketing/common'
import { queueGroupName } from './queue-group-name'
import { Order } from '../models/order'
import { OrderCancelledPublisher } from './order-cancelled-publisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
	readonly subject = Subjects.ExpirationComplete
	queueGroupName = queueGroupName

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message){
		const order = await Order.findById(data.orderId).populate('ticket')

		if(!order){
			throw new Error('order not found')		
		}
	
		// in case the ticket expire but has been pay in the concurrency time
		if(order.status === OrderStatus.Complete){
			return msg.ack()
		}

		order.set({
			status: OrderStatus.Cancelled 
			// on the ticketSchema.methods.isReserved, .Cancelled is not register
			// so as soon as cancelled the ticket will be released
		})

		await order.save()

		await new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id
			}
		})

		msg.ack()
	}
}

