import mongoose from 'mongoose'
import { OrderStatus } from '@microticketing/common'
import { TicketDoc } from './ticket'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current' 

// just for it to be importable in ticket.ts
// without making 2 imports statement
export { OrderStatus }

// the type when client add an order
interface OrderAttrs {
	userId: string
	status: OrderStatus
	expireAt: Date
	ticket: TicketDoc 
}

// the type when ticket come from database
interface OrderDoc extends mongoose.Document {
	userId: string
	status: OrderStatus
	expireAt: Date
	version: number 
	ticket: TicketDoc
}

interface OrderModel extends mongoose.Model<OrderDoc>{
	build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
	userId: {
		type: String,
		require: true
	},
	status: {
		type: String,
		require: true,
		enum: Object.values(OrderStatus), // strict type
		default: OrderStatus.Created // default value in case...
	},
	expireAt: {
		type: mongoose.Schema.Types.Date
	},
	ticket: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Ticket'
	},

}, {
	toJSON:{
		transform(doc, ret){
			ret.id = ret._id
			delete ret._id
		},
	},
})
// plugin from the mongoose-update-if-current
// make sure the __v is renamed version, and increase automaticaly at any update
// .plugin() is a mongoose's method
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
