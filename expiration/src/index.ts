import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async() => {
	console.log("expiration svc started...")

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

		new OrderCreatedListener(natsWrapper.client).listen()
	

	} catch(e) {
		console.error(e)
	}	
}

start()
