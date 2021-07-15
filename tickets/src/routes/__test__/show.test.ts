import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

it('ticket is not found return 404', async() => {
	// generate a valide id for the test
	const id = new mongoose.Types.ObjectId().toHexString()
	await request(app)
		.get(`/api/tickets/${id}`)
		.send()
		.expect(404)
})

it('return the ticket if the ticket is found', async() => {
	const title = 'qwerty'
	const price = 10

	const respPost = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201)
		
	const respGet = await request(app)
		.get(`/api/tickets/${respPost.body.id}`)
		.send()
		.expect(200)

	expect(respGet.body.title).toEqual(title)
	expect(respGet.body.price).toEqual(price)
})


