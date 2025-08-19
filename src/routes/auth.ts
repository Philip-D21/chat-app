import express from 'express';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

import {
	register,
	login,
} from '../controllers/auth'


const router = express.Router()


// User routes
router.post('/signup', register)
router.post('/login', login)


export default router;
