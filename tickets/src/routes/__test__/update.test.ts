import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Ticket } from '../../models/ticket'
// recall it will import the mock function
import { natsWrapper } from '../../nats-wrapper'


it('return 404 is the provided id does not exist', async() => {
	const id = mongoose.Types.ObjectId().toHexString()
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'jhgjhg',
			price: 20,
		})
		.expect(404)
})

it('return a 401 if the user is not auth', async() => {
	const id = mongoose.Types.ObjectId().toHexString()
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'jhgjhg',
			price: 20,
		})
		.expect(401)

})

it('return 401 if the user does not own a ticket', async() => {
	const response = await request(app)
				.post('/api/tickets')
				.set('Cookie', global.signin())
				.send({
					title: 'kjhgjk',
					price: 10
				})
				
	// the way we call global.signin() a second time create a new user
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'mjhgfjhg',
			price: 200
		})
		.expect(401)
})

it('return a 400 if the user provide an invalide title or price', async() => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'kjhgjk',
			price: 10
		})
	
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 200
		})
		.expect(400)
	
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'ouyoiuy',
			price: -10
		})
		.expect(400)
})

it('return 404 if the provided id does not exist', async() => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'kjhgjk',
			price: 10
		})
	
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 510
		})
		.expect(200)

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()

	expect(ticketResponse.body.title).toEqual('new title')
	expect(ticketResponse.body.price).toEqual(510)
})

it("make sure the natswrapper publish an aupdate event", async() => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'kjhgjk',
			price: 10
		})
	
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 510
		})
		.expect(200)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('reject updates if the ticket is reserved', async() => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'kjhgjk',
			price: 10
		})

	const ticket = await Ticket.findById(response.body.id)
	ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()})
	await ticket!.save()

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 510
		})
		.expect(400)



})
