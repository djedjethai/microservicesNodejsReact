import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@microticketing/common'
import { Ticket } from '../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
	readonly subject = Subjects.TicketUpdated
	queueGroupName = queueGroupName

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
		
		// const test = await Ticket.find()

		const ticket = await Ticket.findByEvent(data)

		if(!ticket){
			throw new Error('ticket not found')
		}

		// !!! Version is optional as i use the hand make middleware ".pre()"
		// if i use 'mongoose-update-if-current' like in ticket service
		// i should remove it as it will be automatic
		// const { title, price, version } = data
		const { title, price } = data
		ticket.set({ title, price })
		await ticket.save()

		msg.ack()
	}
}
