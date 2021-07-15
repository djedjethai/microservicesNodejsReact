import request from 'supertest'
import { app } from '../../app'

it('fails with an email wich does not exist', async() => {
	await request(app) 
		.post('/api/users/signin')
		.send({
			email:'test@test.com',
			password:'password'
		})
		.expect(400)

})

it('fails when an incorrect password is supply', async() => {
	await request(app) 
		.post('/api/users/signup')
		.send({
			email:'test@test.com',
			password:'password'
		})
		.expect(201)

	await  request(app) 
		.post('/api/users/signin')
		.send({
			email:'test@test.com',
			password:'kjghkhg'
		})
		.expect(400)
})

it('respond with a cookie when given valid credential', async() => {
	await request(app) 
		.post('/api/users/signup')
		.send({
			email:'test@test.com',
			password:'password'
		})
		.expect(201)

	const response = await  request(app) 
		.post('/api/users/signin')
		.send({
			email:'test@test.com',
			password:'password'
		})
		.expect(200)
	
	expect(response.get('Set-Cookie')).toBeDefined()
})


