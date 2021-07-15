import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@microticketing/common'
import mongoose from 'mongoose'

import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'


const setup = async() => {
	// create an instance of the listener
	const listener = new TicketUpdatedListener(natsWrapper.client)	

	// create a ticket 
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})
	await ticket.save()

	// fake data event
	const data: TicketUpdatedEvent['data'] = {
		version: ticket.version + 1,
		id: ticket.id,
		title: 'concert updated',
		price: 200,
		userId: mongoose.Types.ObjectId().toHexString()
	}
	
	// create a fake message object
	// 'Message' type have many methods, we won't implement them all so
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg, ticket }
}

it('finds, updates, and save a ticket', async() => {		
	const { listener, data, msg, ticket } = await setup()

	// callthe onMessage function with the data and message
	await listener.onMessage(data, msg) // create an entry in the db

	// make assertion to make sure ticket has been created
	const updatedTicket = await Ticket.findById(data.id)

	expect(updatedTicket).toBeDefined()
	expect(updatedTicket!.title).toEqual(data.title)
	expect(updatedTicket!.price).toEqual(data.price)
	expect(updatedTicket!.version).toEqual(data.version)
})	

it('acks the message', async() => {
	const { listener, data, msg, ticket } = await setup()

	// callthe onMessage function with the data and message
	await listener.onMessage(data, msg) // create an entry in the db

	expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack() if the version number is incorrect', async() => {
	const { listener, data, msg, ticket } = await setup()

	data.version = 10

	try{
		await listener.onMessage(data, msg)
	} catch(e) {

	}

	expect(msg.ack).not.toHaveBeenCalled()
})
