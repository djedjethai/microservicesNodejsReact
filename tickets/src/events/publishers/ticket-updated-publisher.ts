import { Publisher, Subjects, TicketUpdatedEvent } from '@microticketing/common'


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
	readonly subject = Subjects.TicketUpdated
	
}
