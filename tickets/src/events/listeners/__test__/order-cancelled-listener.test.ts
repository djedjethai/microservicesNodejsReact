import { natsWrapper } from '../../../nats-wrapper'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent } from '@microticketing/common'
import { OrderCancelledListener } from '../order-cancelled.listener'
import { Ticket } from '../../../models/ticket'
import mongoose from 'mongoose'

const setup = async() => {
	const listener = new OrderCancelledListener(natsWrapper.client)

	const orderId = mongoose.Types.ObjectId().toHexString()
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: 'jgfjjhgf'
	})
	// just above i should add an orderId field, which is not in the interface
	// this is the workaround
	ticket.set({ orderId })

	await ticket.save()

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { msg, data, ticket, orderId, listener }
}

it('update the ticket, publish the event, and ack the message', async() => {
	const { msg, data, ticket, orderId, listener } = await setup()

	await listener.onMessage(data, msg)

	// make sure the ticket is deleted
	const updatedTicket = await Ticket.findById(ticket.id)
	expect(updatedTicket!.orderId).not.toBeDefined()
	
	// make sure the acknowledgement has been called
	expect(msg.ack).toHaveBeenCalled()

	// make sure an event has been published
	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
