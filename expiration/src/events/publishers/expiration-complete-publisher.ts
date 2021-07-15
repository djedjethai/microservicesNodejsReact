import { Subjects, Publisher, ExpirationCompleteEvent } from '@microticketing/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
	readonly subject = Subjects.ExpirationComplete
} 
