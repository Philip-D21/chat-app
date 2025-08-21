import  jwt, { JwtPayload} from "jsonwebtoken";
import { Request, Response, NextFunction} from 'express';
import AppError from '../utils/appError';


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        if (!token) {
            return next(new AppError('No token provided', 401));
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (!decoded || !(decoded as any).id) {
            return next(new AppError('Invalid token payload', 401));
        }
        (req as any).user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid token', 401));
    }
}



// 👇 helper for sockets
export const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    return null;
  }
};
