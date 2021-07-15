import { Message } from 'node-nats-streaming'
import { TicketCreatedEvent } from '@microticketing/common'
import mongoose from 'mongoose'

import { TicketCreatedListener } from '../ticket-created-listener'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'


const setup = async() => {
	// create an instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client)	

	// fake data event
	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
		userId: mongoose.Types.ObjectId().toHexString()
	}
	
	// create a fake message object
	// 'Message' type have many methods, we won't implement them all so
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg }
}

it('read and save a ticket', async() => {		
	const { listener, data, msg } = await setup()

	// callthe onMessage function with the data and message
	await listener.onMessage(data, msg) // create an entry in the db

	// make assertion to make sure ticket has been created
	const ticket = await Ticket.findById(data.id)

	expect(ticket).toBeDefined()
	expect(ticket!.title).toEqual(data.title)
	expect(ticket!.price).toEqual(data.price)
})	

it('acks the message', async() => {
	const { listener, data, msg } = await setup()

	// callthe onMessage function with the data and message
	await listener.onMessage(data, msg) // create an entry in the db

	expect(msg.ack).toHaveBeenCalled()
})
