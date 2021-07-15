import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { BadRequestError, validateRequest } from '@microticketing/common'

import { User } from '../models/user'

const router = express.Router()

router.post('/api/users/signup', [
		body('email')
			.isEmail()
			.withMessage('email must be provided'),
		body('password')
			.trim()
			.isLength({min:4, max:20})
			.withMessage('password must be between 4 to 20 char')
		
	],
	validateRequest,
	async(req: Request, res: Response) => {
		
		const { email, password } = req.body

		// check if email input exist already
		const existingUser = await User.findOne({email})
		if(existingUser) {
			throw new BadRequestError("Email in use")
		}

		// hash password, comming soon
		
		// create user
		const user = User.build({email, password})
		await user.save()

		// create jwt
		const userJwt = jwt.sign({
			id: user.id,
			email: user.email
		}, 
			process.env.JWT_KEY! // le ! for typeScript to forget this checking
		)	
		// imperative command to create the secret with k8s
		// kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
		// but i created a secret.yaml to make it automatic on each build

		// store it on session object, must be define like it for TS
		req.session = {
			jwt: userJwt
		}

		res.status(201).send(user)
	}
)

export { router as signupRouter }
