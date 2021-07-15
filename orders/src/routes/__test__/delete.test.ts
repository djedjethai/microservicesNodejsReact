import request from 'supertest'
import mongoose from 'mongoose' 
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

it('marks an order as concelled', async() => {
	// create a new ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title:'concert',
		price:20
	})
	await ticket.save()

	const user = global.signin()
	
	// make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ticketId: ticket.id})
		.expect(201)

	// crteate a request to concel an order
	const { body: fetchedOrder } = await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204)

	// query the order to see if it has been updated
	const updatedOrder = await Order.findById(order.id)

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an event cancel an event', async() => {
	// create a new ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title:'concert',
		price:20
	})
	await ticket.save()

	const user = global.signin()
	
	// make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ticketId: ticket.id})
		.expect(201)

	// crteate a request to concel an order
	const { body: fetchedOrder } = await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
