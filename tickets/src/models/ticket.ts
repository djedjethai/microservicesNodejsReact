import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current' 

// the type when client add a ticket
interface TicketAttrs {
	title: string
	price: number
	userId: string
}

// the type when ticket come from database
interface TicketDoc extends mongoose.Document {
	title: string
	price: number
	userId: string
	version: number
	orderId?: string // ? means optional, as at first it won t have any order's id
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema({
	title: {
		type: String,
		require: true
	},
	price: {
		type: Number,
		require: true
	},
	userId: {
		type: String,
		require: true
	},
	orderId: {
		type: String
	}
}, {
	toJSON: {
		transform(doc, ret){
			ret.id = ret._id
			delete ret._id
		}
	}
})

// plugin from the mongoose-update-if-current
// make sure the __v is renamed version, and increase automaticaly at any update
// .plugin() is a mongoose's method
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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }

