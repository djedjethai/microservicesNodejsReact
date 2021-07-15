import { Ticket } from '../ticket'

// the OCC is the action to increment automaticaly the __v(renamed version in our case)
it('implements optimistic concurrency control', async(done) => {
	// create an instance of a ticket
	const ticket =  Ticket.build({
		title:'the title',
		price:10.6,
		userId:'123'
	})

	// save the ticket to the db
	await ticket.save()

	// fetch the ticket twice
	const firstInstance = await Ticket.findById(ticket.id)
	const secondInstance = await Ticket.findById(ticket.id)

	// change/update each ticket fetched
	firstInstance!.set({price:7})	
	secondInstance!.set({price:14})

	// save the first fetched ticket
	const firstResp = await firstInstance!.save()

	// save the second fetched ticket
	// should get an err as __v number as been incremented with the previous update
	// this test implementation, is a tricks as typescript makes pb with jest
	// the catch(e) should return, so we never reach the last line.
	try{
		await secondInstance!.save()
	} catch(e) {
		return done()
	}	
	throw new Error('should not reach this point')
	
})

it('makes sure the version ticket is incremented', async() => {
	// create an instance of a ticket
	const ticket =  Ticket.build({
		title:'the title',
		price:10.6,
		userId:'123'
	})

	// save the ticket to the db
	await ticket.save()
	expect(ticket.version).toEqual(0)
	await ticket.save()
	expect(ticket.version).toEqual(1)
	await ticket.save()
	expect(ticket.version).toEqual(2)

})
