import mongoose from 'mongoose'

import { app } from './app'

const start = async() => {
	console.log('starting up.....')

	// verif secret's env in k8s
	if(!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be define')
	}

	if(!process.env.MONGO_URI){
		throw new Error('MONGO_URI must be define')
	}

	try{
		// /auth cree the database 
		await mongoose.connect(process.env.MONGO_URI,{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
		console.log('connected to mongodb')
	} catch(e) {
		console.error(e)
	}	
	
	app.listen('3000', () => {
		console.log('auth listening on 3000!!!')
	})
}

start()
