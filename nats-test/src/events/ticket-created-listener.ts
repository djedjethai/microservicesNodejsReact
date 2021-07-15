import { Message } from 'node-nats-streaming'

// import { Listener } from './base-listener'
import { Listener } from '@microticketing/common'
import { TicketCreatedEvent } from '@microticketing/common'
import { Subjects } from '@microticketing/common'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {

	// by setting readonly, it makes sure we can not change the type of subject
	// with anoyher type of the TicketCreateEvent interface.
	readonly subject = Subjects.TicketCreated
	queueGroupName = 'payments-service'

	onMessage(data: TicketCreatedEvent['data'], msg: Message){
		console.log('Event data: ', data)
		
		console.log(data.id)
		console.log(data.price)
		console.log(data.title)

		// in case all is fine, to acknowledge the event
		msg.ack()
	}
}

// // we set option by passing functions like '.setManualAckMode()'
// 	// setDeliverAllAvailable() return the history of the nats stream 
// 	// means that even i restart the listener, nats re-send all events previously sent
// 	// last option: setDurableName() make sure that previously proceed services won t be resend
// 	// !! the queue-group option must be activate for setDurableName() to work as expected
// 	const options = stan
// 		.subscriptionOptions()
// 		.setManualAckMode(true)
// 		.setDeliverAllAvailable()
// 		.setDurableName('accounting-service')
// 	// the second element is the queue group, 
// 	// it will make sure that only one listener in this queue group will get the event
// 	const subscription = stan.subscribe(
// 		'ticket:created', 
// 		'orders-service-queue-group',
// 		options
// 	)
// 	subscription.on('message', (msg: Message) => {
// 		
// 		const data = msg.getData()
// 
// 		if(typeof data === 'string'){
// 			console.log(`Received event #${msg.getSequence()}, with data: ${JSON.parse(data)}`)
// 		}
// 		
// 		// Aknowledge the event that it has been received
// 		// we need it as we set the .setManualAckMode(true) to true
// 		msg.ack()
// 	})
// 
