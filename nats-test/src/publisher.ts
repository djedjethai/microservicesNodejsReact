import nats from 'node-nats-streaming'

import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', 'abc', {
	url: 'http://localhost:4222'
}) 

stan.on('connect', async() => {
	console.log('publisher connected to nats')

	const data = {
		id: '123',
		title: 'a title de ouf',
		price: 20,
		userId: 'qwe'
	}

	const stanPub = new TicketCreatedPublisher(stan)

	try{
		await stanPub.publish(data)
	} catch(e) {
		console.log(e)
	}
})


