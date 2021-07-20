import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@microticketing/common'
import { stripe } from '../../stripe'

// tell jest to use our stripe's mock function instead of the real one
jest.mock('../../stripe')

it('return a 404 when purchasing an order which does not exist', async() => {
	await request(app)
		.post('/api/payments')
		// @ts-ignore
		.set('Cookie', global.signin())
		.send({
			token: 'jhgfjhf',
			orderId: mongoose.Types.ObjectId().toHexString()
		})
		.expect(404)
})

it('return a 401 when purchasing an order which does not belong to the user', async() => {
	// create an order
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created
	})
	await order.save()
	
	// create a payment with the previously saved order id(belonging to someone else so)
	await request(app)
		.post('/api/payments')
		// @ts-ignore
		.set('Cookie', global.signin())
		.send({
			token: 'jhgfjhf',
			orderId: order.id
		})
		.expect(401)
})

it('return a 400 when purchasing a cancelled order', async() => {
	const userId = mongoose.Types.ObjectId().toHexString()
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		// @ts-ignore
		.set('Cookie', global.signin(userId))
		.send({
			token: 'jhgfjhf',
			orderId: order.id
		})
		.expect(400)

})

it('return 204 with valide imput', async() => {
	const userId = mongoose.Types.ObjectId().toHexString()
	// create an order
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Created
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		// @ts-ignore
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id
		})
		.expect(201)

	// access the mock function arguments
	// in our case, access first arg [0][0]
	// const chargeOptions = stripe.charges.create.mock.calls[0][0] 
	// ts create an err solution next line
	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

	expect(chargeOptions.source).toEqual('tok_visa')
	expect(chargeOptions.amount).toEqual(20*100)
	expect(chargeOptions.currency).toEqual('usd')
})
