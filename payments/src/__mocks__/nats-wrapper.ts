// we implement the nats-wrapper class, which is id an object...
// getting its properties and methods from base-publisher in the common module
// so here we just mock the base-publisher class methods (which is just the publish())
export const natsWrapper = {
	client: {
		// fake function, works but does not reproduce the code execution
		// publish: (subject: string, data: string, cb: () => void) => {
		// 	cb()
		// } 
		// lets make a mock function
		publish: jest.fn().mockImplementation(
			(subject: string, data: string, cb: () => void) => {
				cb()
			}
		)
	}
} 
