import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requireAuth,
	validateRequest,
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus
} from '@microticketing/common'
import { stripe } from '../stripe'
import { Order } from '../models/order'
import { Payment } from '../models/payment'

const router = express.Router()

router.post('/api/payments', 
	requireAuth,
	[
		body('token')
			.not()
			.isEmpty(),
		body('orderId')
			.not()
			.isEmpty()
	], 
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body
		
		const order = await Order.findById(orderId)
		// check various conditions before allowing payment
		if(!order) throw new NotFoundError()
		if(order.userId !== req.currentUser!.id) throw new NotAuthorizedError()
		if(order.status === OrderStatus.Cancelled) throw new BadRequestError('Can not pay for a cancelled order')

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100, // convert from $ to cents
			source: token
		})

		console.log('grrr: ', charge.id)
		const payment = Payment.build({
			orderId,
			stripeId: charge.id
		})
		await payment.save()

		res.status(201).send({success:'true'})
	}
)

export { router as createChargeRouter }
