import express from "express";
import AuthController from "../controllers/Auth";
const router = express.Router()

router.post('/signUp', AuthController.SignUp)

router.post('/login' , AuthController.login)


export default router