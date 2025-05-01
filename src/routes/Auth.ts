import express from "express";
import AuthController from "../controllers/Auth";
import Auth from "../middleware/middleware";
const router = express.Router()

router.post('/sign-up', AuthController.SignUp)

router.post('/login', AuthController.login)

router.get('/userId', Auth.checkToken, AuthController.fetchUserId)

router.get('/profile', Auth.checkToken, AuthController.fetchUser)

router.get('/refreshToken', AuthController.refreshToken)

router.get('/:nid', AuthController.searchPatient)

router.delete('/logout' , AuthController.logOut)

export default router