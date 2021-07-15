import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../app'

// declare the global.signin() for ts
declare global {
	namespace NodeJS {
		interface Global {
			signup(): Promise<string[]>
		}
	}
}

let mongo: any
beforeAll(async() => {
	process.env.JWT_KEY = 'jytjgfjhg'

	mongo = new MongoMemoryServer()
	const mongoUri = await mongo.getUri()

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
})

beforeEach(async() => {
	const collections = await mongoose.connection.db.collections()

	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async() => {
	await mongo.stop()
	await mongoose.connection.close()
})

// set this hepler function as global to get it in any test file without importing it
// this function won t be available anywhere else
global.signup = async() => {
	const email = 'email@email.com'
	const password = 'password'

	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password
		})
		.expect(201)

	const cookie = response.get('Set-Cookie')

	return cookie
}
