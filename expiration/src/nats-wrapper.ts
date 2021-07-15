import nats, { Stan } from 'node-nats-streaming'

class NatsWrapper {
	// the ? say to ts that this properties will be set later
	private _client?: Stan
	
	get client() {
		if(!this._client){
			throw new Error('Can not access nats client before connecting')
		}
		
		return this._client
	}

	connect(clusterId: string, clientId: string, url: string){
		this._client = nats.connect(clusterId, clientId, { url })

		// need the exclamation point as ts do not reconize 
		// the this._client from outside the event with the one inside
		return new Promise<void>((resolve, reject) => {
			this.client.on('connect', () => {
				console.log('connected to NATS')
				resolve()
			})

			this.client.on('error', (e) => {
				reject(e)
			})

		})
	}
}	 

// exporting this way makes sure we are exporting only one instance 
// BUT NOT THE CLASS. Means we have here a Singleton pattern
export const natsWrapper = new NatsWrapper()
