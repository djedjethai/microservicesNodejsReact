import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@microticketing/common'

import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { indexTicketRouter } from './routes/index'
import { updateTicketRouter } from './routes/update'

const app = express()
// inform express that req/res are going throught ingress nginx proxy
// and should trust trafic
app.set('trust proxy', true)  

app.use(json())
app.use(
	cookieSession({
		signed: false, // desable encryption
		// secure:true // make sure is only use on https 
		secure: process.env.NODE_ENV !== 'test' // for testing purpose as supertest
		// can not set https. so if no env 'secure: true'
	})
)

app.use(currentUser)

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)
// for any unknow url what ever the method (.all) throw 404 err
// for any async code, the err must be pass into next() to be catch by the errHandler
// in this ex, setting async() throw new Err asynchronously, so we use next()
// but next() is special to express so let use express-async-errors
app.all('*', async(req, res, next) => {
	throw new NotFoundError() // not for async code
	// next(new NotFoundError())
})

app.use(errorHandler)

export { app }
