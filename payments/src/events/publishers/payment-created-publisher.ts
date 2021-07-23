import { Subjects, Publisher, PaymentCreatedEvent } from '@microticketing/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated 
}
