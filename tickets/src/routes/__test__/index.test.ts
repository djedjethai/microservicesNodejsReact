import request from 'supertest'
import { app } from '../../app'

const addTicket = () => {
	return request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'qwerty',
			price: 10
		})
}


it('fetch a list of tickets', async() => {
	// add some tickets before to test the request
	await addTicket() 
	await addTicket() 
	await addTicket() 

	const response = await request(app)
				.get('/api/tickets')
				.send()
				.expect(200)
	
	expect(response.body.length).toEqual(3)
})
