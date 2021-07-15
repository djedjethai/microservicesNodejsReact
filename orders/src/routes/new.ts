import express, { Request, Response } from 'express'
import { 
	requireAuth, 
	validateRequest,
	NotFoundError, 
	OrderStatus,
	BadRequestError
} from '@microticketing/common'
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'


const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60

router.post('/api/orders', requireAuth, [
	body('ticketId')
		.not()
		.isEmpty()
		// validation maybe not good as it couple this svc to the ticket one
		.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
		.withMessage('ticket id must be provided')
], validateRequest, async(req: Request, res: Response) => {
	const { ticketId } = req.body

	// find the ticket the user want to order
	const ticket = await Ticket.findById(ticketId)
	if(!ticket) {
		throw new NotFoundError()
	}

	// make sure this ticket is not already reserved
	// query all orders and check if status is not reserved
	const isReserved = await ticket.isReserved() 
	if(isReserved){
		throw new BadRequestError('Ticket is already reserved')
	}

	// calculate an expiration date for this order
	const expiration = new Date()
	expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

	// (after 3 previous steps passed) build the order and save it to db
	const order = Order.build({
		userId: req.currentUser!.id,
		status: OrderStatus.Created,
		expireAt: expiration,
		ticket: ticket
	})
	await order.save()

	// publish an event saying that an order has been created
	new OrderCreatedPublisher(natsWrapper.client).publish({
		id: order.id,
		status: order.status,
		userId: order.userId,
		expireAt: order.expireAt.toISOString(), // convert to utc time string format
		version: order.version,
		ticket:{
			id: ticket.id,
			price: ticket.price
		}
	})	


	res.status(201).send(order)
})

export { router as newOrderRouter }


