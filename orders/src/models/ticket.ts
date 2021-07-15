import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current' 

// before db
interface TicketAttrs {
	id: string
	title: string
	price: number
} 

export interface TicketDoc extends mongoose.Document{
	title: string
	price: number
	version: number
	isReserved(): Promise<boolean>		
}

interface TicketModel extends mongoose.Model<TicketDoc>{
	build(attrs: TicketAttrs): TicketDoc
	findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
} 

const ticketSchema = new mongoose.Schema({
	title:{
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	}
}, {
	toJSON:{
		transform(doc, ret) {
			ret.id = ret._id
			delete ret._id
		}
	}
})
// make sure the __v is renamed version, and increase automaticaly at any update
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

// increase the version number of the ticket to fix the concurrency issue
// hook which make sure at save time, that the id + the "version" number match
// ticketSchema.pre('save', function(done){
// 	// @ts-ignore
// 	this.$where = {
// 		version: this.get('version') - 1
// 	}
// 
// 	done()
// })

// add function 'build()' to any ticketSchema
ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket({
		_id: attrs.id, // !!!important, without this line, mongoose the id
		title: attrs.title,
		price: attrs.price
	})
}

ticketSchema.statics.findByEvent = (data: { id: string, version: number }) => {
	return Ticket.findOne({
			_id: data.id,
			version: data.version - 1
		})

}

// add a method 'isReserved()' to ticketSchema, 
// note that is different than an static method
ticketSchema.methods.isReserved = async function(){
	// this === the ticketDocumentthat we just called 'isReserved'
	const existingOrder = await Order.findOne({
		ticket: this.id,
		status: {
			$in:[
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete
			]
		}
	})

	// flip twice the value of existingOrder, makes it become a bool
	return !!existingOrder
}


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }

