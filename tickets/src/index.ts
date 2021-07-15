import mongoose from 'mongoose'

import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled.listener'


const start = async() => {
	
	// verif secret's env in k8s
	if(!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be define')
	}
	
	if(!process.env.MONGO_URI){
		throw new Error('MONGO_URI must be define')
	}

	if(!process.env.NATS_URL){
		throw new Error('NATS_URL must be define')
	}

	if(!process.env.NATS_CLIENT_ID){
		throw new Error('NATS_CLIENT_ID must be define')
	}

	if(!process.env.NATS_CLUSTER_ID){
		throw new Error('NATS_CLUSTER_ID must be define')
	}

	try{
		// connect the nats-streaming( our events instance )
		// first arg (clusterId), match the declaration inside the nats-depl.yaml
		// third arg is the srv of nats-depl on the port 4222
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID, 
			process.env.NATS_CLIENT_ID, 
			process.env.NATS_URL
		)
		
		// closing event as nats wrapper do not close immediately
		// force it to close in case of 'SIGINT' or 'SIGTERM'
		const stanClient = natsWrapper.client
		stanClient.on('close', () => {
			console.log('connection closed')
			process.exit(0)
		})
		process.on('SIGINT', () => stanClient.close())
		process.on('SIGTERM', () => stanClient.close())

		new OrderCreatedListener(stanClient).listen()
		new OrderCancelledListener(stanClient).listen()

		// /auth cree the database 
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
		console.log('connected to mongodb')
	} catch(e) {
		console.error(e)
	}	
	
	app.listen('3000', () => {
		console.log('ticketing listening on 3000!!!')
	})
}

start()
