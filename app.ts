import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { AppDataSource } from './ormconfig'
import AuthRoutes from './src/routes/Auth'
import { Response, Request, NextFunction, ErrorRequestHandler } from 'express'
import createHttpError from "http-errors";


const app = express()
app.use(express.json())


app.use('/auth', AuthRoutes)

app.use(
    (err: ErrorRequestHandler
        , req: Request
        , res: Response
        , next: NextFunction
    ) => {
        let status: number = 500;
        let message: string = "Internal Server Error";

        if (createHttpError.isHttpError(err)) {
            status = err.statusCode;
            message = err.message;
        }
        res.status(status).json({ message: message });
        return
    }
)
AppDataSource.initialize().then(() => {
    app.listen(process.env.DB_PORT_SERVER, () => {
        console.log('started our first server')
    })
})