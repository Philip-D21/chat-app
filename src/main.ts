import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
dotenv.config();


//import routes
import authRouter from './routes/auth';

const app = express();

// Import global error handler and utility functions
import globalErrorHandler from './middleware/errorHandler'
// import AppError from './utils/appError'

// Calling the database and sync
import './model/index'


//middlewares 
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));
// Helmet helps secure Express apps by setting various HTTP headers
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

app.listen(port, () => {
    console.log(`Server is running on port ${port} 🚀`);
})