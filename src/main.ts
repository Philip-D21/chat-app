import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
import { Server } from 'socket.io';
dotenv.config();


//import routes
import authRouter from './routes/auth';
import chatRouter from './routes/chat';

const app = express();

// Import global error handler and utility functions
import globalErrorHandler from './middleware/errorHandler'
// import AppError from './utils/appError'

import './model/index';
import './model/sync';


import chatSocket from './socket/chatEvent'; 


//middlewares 
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(helmet());

// Enable CORS
app.use(
	cors({
		origin: '*',
		credentials: true,
	}),
)

//definiing routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chat', chatRouter);


app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send('Hello world! Stay cheesed up 👌')
})


// Handle undefined routes
// app.all('*', (req: Request, res: Response, next: NextFunction) => {
// 	const message = `Can't find ${req.originalUrl} on this server!`
// 	return next(new AppError(message, 404))
// })

app.use(globalErrorHandler);
const port = process.env.PORT || 2025;


const server = app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});


const io = new Server(server, { cors: { origin: '*' } });
console.log('Socket.IO ready 🚀');
chatSocket(io);