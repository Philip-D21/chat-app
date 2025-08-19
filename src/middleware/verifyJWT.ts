import jwt from "jsonwebtoken";
import { Request, Response, NextFunction} from 'express';
import AppError from '../utils/appError';


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            return next(new AppError('No token provided', 401));
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid token', 401));
    }
}