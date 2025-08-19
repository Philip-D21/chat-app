import { Request, Response } from 'express';
import UserModel from '../model/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserI } from '../helpers/types';


export const register = async (req: Request, res: Response) => {
	try {
		const { firstname, lastname, username, email, password } = req.body as UserI

		const userNameExists = await UserModel.findOne({
			where: { username: username },
		})

		if (userNameExists) {
			throw new Error('Username already exists')
		}

		const emailExists = await UserModel.findOne({ where: { email: email } })

		if (emailExists) {
			throw new Error('Email already registered')
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await UserModel.create({
			firstname,
			lastname,
			username,
			email,
			password: hashedPassword,
		})

	
		return res.status(201).json({
            status: 'success',
            data: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
            }
        })
	} catch (error: any) {
		return res.status(400).json({
			status: 'error',
			message: error.message || 'Registration failed'
		});
	}
}





export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			throw new Error('Please provide email and password')
		}

		const user = await UserModel.findOne({ where: { email } })

		if (!user) {
			throw new Error('Invalid email address')
		}

		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			throw new Error('Invalid password')
		}

		const token = jwt.sign(
			{
				id: user.id,
				firstname: user.firstname,
				username: user.username,
				email: user.email,
			},
			process.env.JWT_SECRET as string
		)
		return res.status(200).json({
			status: 'success',
			message: 'User logged in successfully',
			data: {
				token,
				userId: user.id,
				firstname: user.firstname,
				username: user.username,
				email: user.email,
			}
		})
	} catch (error: any) {
      return res.status(400).json({
          status: 'error',
          message: error.message || 'Login failed'
      });
	}
}
