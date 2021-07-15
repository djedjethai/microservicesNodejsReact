import { Publisher, OrderCancelledEvent, Subjects} from '@microticketing/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
	readonly subject = Subjects.OrderCancelled
}
