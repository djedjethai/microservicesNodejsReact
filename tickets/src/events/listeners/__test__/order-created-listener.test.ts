import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@microticketing/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async() => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 34,
        userId: 'khgklk'
    })
    await ticket.save()

    // create a fake data object/event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: 'gfdgfgsdf',
        expireAt: 'grter',
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('set  the userId of the ticket', async() => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    // need to refresh the ticket as it has some outdated datas 
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)

})

it('ack the message', async() => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('it publish an updated event', async() => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    // natsWrapper is a Mock func 
    // .client.publish are Publisher(abstract class)'s attached method
    // linking them to the natsWrapper just mocks these method/properties as well 
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    // see what has been called in the mock func
    // @ts-ignore
    const ticketUpdatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1])

    expect(data.id).toEqual(ticketUpdatedData.orderId)

})