import express from "express";
import AuthController from "../controllers/Auth";
import Auth from "../middleware/middleware";
import { RegisterPatientSchema } from "../Schemas/RegisterSchema";
import validate from "../Schemas/SchemaValidation";
const router = express.Router()

router.post('/sign-up', validate(RegisterPatientSchema), AuthController.SignUp)

router.post('/login', AuthController.login)

router.get('/userId', Auth.checkToken, AuthController.fetchUserId)

router.get('/profile', Auth.checkToken, AuthController.fetchUser)

// router.get('/patient/:nid' , Auth.checkToken ,AuthController.fetchAllPatientData)

router.get('/doctor', Auth.checkToken, AuthController.fetchDoctorData)

router.get('/refreshToken', AuthController.refreshToken)

router.get('/:nid', AuthController.searchPatient)

router.delete('/logout', AuthController.logOut)

export default router