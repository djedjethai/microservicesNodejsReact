import { Publisher, Subjects, TicketCreatedEvent } from '@microticketing/common'


export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
	readonly subject = Subjects.TicketCreated 
	
}
