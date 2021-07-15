import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
// we import the nats-wrapper, 
// but it's the __mocks__ nats-wrapper which is call behind the scene 
import { natsWrapper } from '../../nats-wrapper'

// by this way jest is going to see that we try to import that file
// and it gonna mock it with the one into __mock__
// jest.mock('../../nats-wrapper')

// make sure we can reach this url, make sure we don t get a 404
it('has a route handler listening to /api/tickets for post req', async() => {
	const response = await request(app)
		.post('/api/tickets')
		.send({})

	expect(response.status).not.toEqual(404)
})

// make a req to this url without being authenticated
it('it can only be acces if the user is signin', async() => {
	const response = await request(app)
		.post('/api/tickets')
		.send({})

	expect(response.status).toEqual(401)
})

it('return a status other than 401 if the user is signin', async() => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({})
	
	expect(response.status).not.toEqual(401)
})


it('returns an error if an invalid title is provided', async() => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({
			title: '',
			price: 10
		})
		.expect(400) // same as .toEqual()
	
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({
			price: 10
		})
		.expect(400) // same as .toEqual()
})

it('returns an error if an invalid price is provided', async() => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({
			title: 'kjghkh',
			price: -10
		})
		.expect(400) // same as .toEqual()
	
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({
			title: 'khgjkhg'
		})
		.expect(400) // same as .toEqual()

})

it('create a ticket with valid inputs', async() => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin()) // set the made up cookie into the request
		.send({
			title: 'qwerty',
			price: 10
		})
		.expect(201) 

	// should have only the previous added ticket back from the db
	// supertest reset models between tests
	let tickets = await Ticket.find({})
	expect(tickets[0].price).toEqual(10)
	expect(tickets[0].title).toEqual('qwerty')
})

it("publish a ticket", async() => {
	// create a ticket
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'qwerty',
			price: 10
		})
		.expect(201) 

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
