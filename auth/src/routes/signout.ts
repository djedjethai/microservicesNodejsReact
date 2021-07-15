import express from 'express'

const router = express.Router()

router.get('/api/users/signout', (req, res) => {
	console.log('in hererere: ', req.session)
	req.session = null

	// console.log(req.session)

	res.send({})
})

export { router as signoutRouter }
