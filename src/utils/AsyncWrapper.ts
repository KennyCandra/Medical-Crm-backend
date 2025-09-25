import { Request, Response, NextFunction } from 'express';


export default function asyncWrapper(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
}