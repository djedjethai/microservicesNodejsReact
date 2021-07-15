import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// declare the global.signin() for ts
declare global {
	namespace NodeJS {
		interface Global {
			signin(): string[]
		}
	}
}

// by this way jest is going to see that we try to import that file
// and it gonna mock it with the one into __mock__
jest.mock('../nats-wrapper')

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
	// for jest to clear all mocks's memory
	jest.clearAllMocks()
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
// in the auth service we use it to make a signin req
// here we don t want to have dependencies with auth svc.
// so we will build an auth token like the auth signin does
global.signin = () => {
	// build a jwt payload {id, email}
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'whatever@ever.com'
	}

	// create a jwt (the JWT_KEY has been set up just bf line 19)
	// le ! at the end is for ts to shut up
	const token = jwt.sign(payload, process.env.JWT_KEY!)

	// Build session object
	const session = { jwt: token }

	// Turn that session into json
	const sessionJson = JSON.stringify(session)

	// take that json and encode it as base64
	const base64 = Buffer.from(sessionJson).toString('base64')

	// return a string with the encoded datas
	// for supertest this string should be into array
	return [`express:sess=${base64}`]
}
