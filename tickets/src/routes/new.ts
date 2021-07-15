import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@microticketing/common'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'

import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/tickets', 
	requireAuth, [
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0')
	], 
	validateRequest,
	async(req: Request ,res: Response) => {
		const ticket = Ticket.build({
			title: req.body.title,
			price: req.body.price,
			userId: req.currentUser!.id
		})	
		await ticket.save()

		// no parentheses at .client as in TS a method declared 'get client()'
		// do not take () at execution time
		await new TicketCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		})

		res.status(201).send(ticket)
	}
)

export { router as createTicketRouter }

