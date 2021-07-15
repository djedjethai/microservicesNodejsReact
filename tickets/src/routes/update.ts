import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { natsWrapper } from '../nats-wrapper' 
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import {
	validateRequest,
	NotFoundError,
	requireAuth,
	NotAuthorizedError,
	BadRequestError
} from '@microticketing/common'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.put('/api/tickets/:id', 
	requireAuth, 
	[
		body('title')
			.not()
			.isEmpty()
			.withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and not null')
	],
	validateRequest,
	async(req: Request, res: Response) => {
	const ticket = await Ticket.findById(req.params.id)

	if(!ticket){
		throw new NotFoundError()
	}

	if(ticket.orderId){
		throw new BadRequestError('Cannot edit a reserved ticket')
	}

	if(ticket.userId !== req.currentUser!.id){
		throw new NotAuthorizedError()
	}

	ticket.set({
		title: req.body.title,
		price: req.body.price
	})
	await ticket.save()

	// no parentheses at .client as in TS a method declared 'get client()'
	// do not take () at execution time
	// !!! IF SAVED TO DB BUT EVENT-BUS CRASH WE GOT AS BIG PB
	// SOLUTION SHOULD BE TO SAVE THE EVENT INTO DB AS WELL
	// THE DATA SAVED IN DB AND THE TRANSACTION EVENT SHOULD BE LINK USING A TRANSACTION
	// LIKE SO IF ONE FAIL, ALL DB SAVING ROLL-BACK, but it's not implemented here (see ch-325)
	await new TicketUpdatedPublisher(natsWrapper.client).publish({
		id: ticket.id,
		title: ticket.title,
		price: ticket.price,
		userId: ticket.userId,
		version: ticket.version
	})

	
	res.send(ticket)
})


export { router as updateTicketRouter }

