import { Message } from 'node-nats-streaming'
import { OrderStatus, ExpirationCompleteEvent } from '@microticketing/common'
import mongoose from 'mongoose'

import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'


const setup = async() => {
	// create an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client)	

	// create a ticket 
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})
	await ticket.save()

	const order = Order.build({
		status: OrderStatus.Created,
		userId: 'khjgkhjk',
		expireAt: new Date(),
		ticket
	})
	await order.save()

	// fake data event
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	}
	
	// create a fake message object
	// 'Message' type have many methods, we won't implement them all so
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg, ticket, order }
}

it('it update the order status to cancel', async() => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	const updatedOrder = await Order.findById(order.id)
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an OrderCancelledEvent', async() => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	expect(natsWrapper.client.publish).toHaveBeenCalled()

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	)
	expect(eventData.id).toEqual(order.id)

})

it('ack the message', async() => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})
