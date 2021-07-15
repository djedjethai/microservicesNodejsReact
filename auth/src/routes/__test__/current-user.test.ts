import request from 'supertest'
import { app } from '../../app'

it('get the user details after midleware identification', async() => {
	// 'signin()' is the global func from test file
	// available to any test file to simulate a signup user
	const cookie = await global.signup()

	// as supertest do not provide cookies from req to req,
	// we have to attach it manually
	const response = await request(app)
		.get('/api/users/currentUser')
		.set('Cookie', cookie)
		.send()
		.expect(200)

	// console.log(response.body)
	// the 'email@email.com' is passed into the global.signup()
	expect(response.body.currentUser.email).toEqual('email@email.com')
})

it('respond with null if user is not authenticated', async() => {
	const response = await request(app)
		.get('/api/users/currentUser')
		.send()
		.expect(200)

	expect(response.body.currentUser).toEqual(null)
})


