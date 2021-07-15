import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError } from '@microticketing/common'

import { User } from '../models/user'
import { Password } from '../services/password'

const router = express.Router()

router.post('/api/users/signin', 
	[
		body('email')
			.isEmail()
			.withMessage('the email must be valid'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('password must be supply')
	],
	validateRequest,
	async(req: Request, res: Response) => {
		const { email, password } = req.body

		const existingUser = await User.findOne({ email })
		if(!existingUser) {
			throw new BadRequestError('invalid credentials')
		}
		
		const passwordsMatch = await Password.compare(existingUser.password, password)
		if(!passwordsMatch) {
			throw new BadRequestError('invalid credentials')
		}
		
		// create jwt
		const userJwt = jwt.sign({
			id: existingUser.id,
			email: existingUser.email
		}, 
			process.env.JWT_KEY! // le ! for typeScript to forget this checking
		)	

		// store it on session object, must be define like it for TS
		req.session = {
			jwt: userJwt
		}

		res.status(200).send(existingUser)


	}
)

export { router as signinRouter }
