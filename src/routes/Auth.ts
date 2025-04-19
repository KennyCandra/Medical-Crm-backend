import express from "express";
import AuthController from "../controllers/Auth";
import Auth from "../middleware/middleware";
const router = express.Router()

router.post('/sign-up', AuthController.SignUp)

router.post('/login', AuthController.login)

router.get('/profile', Auth.checkToken, AuthController.fetchUser)

router.get('/:nid', AuthController.searchPatient)


export default router