import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@microticketing/common'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { Order } from '../../../models/order'

const setup = async() => {
     const listener = new OrderCreatedListener(natsWrapper.client)

     const data: OrderCreatedEvent['data'] = {
     	id: mongoose.Types.ObjectId().toHexString(),
     	version: 0,
     	expireAt: 'jjkhgk',
     	userId: 'jhfdff',
     	status: OrderStatus.Created,
     	ticket:{
     		price: 12,
     		id: 'khgcvvv'
     	}
     }
     
     // @ts-ignore
     const msg: Message = {
     	ack: jest.fn()
     }

     return { listener, data, msg }
}

it('replicate the order info', async() => {
     const { listener, data, msg } = await setup()

     await listener.onMessage(data, msg)

     const order = await Order.findById(data.id)

     expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async() => {
     const { listener, data, msg } = await setup()

     await listener.onMessage(data, msg)

     expect(msg.ack).toHaveBeenCalled()
})
