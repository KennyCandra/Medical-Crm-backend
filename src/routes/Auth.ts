import express from "express";
import AuthController from "../controllers/Auth";
import Auth from "../middleware/middleware";
import {
  RegisterPatientSchema,
  LoginSchema,
  resetTokenSchema,
} from "../Schemas/RegisterSchema";
import validate from "../Schemas/SchemaValidation";
const router = express.Router();

router.post("/sign-up", validate(RegisterPatientSchema), AuthController.SignUp);

router.post("/login", validate(LoginSchema), AuthController.login);

router.post("/forget-password", AuthController.forgetPassword);

router.put(
  "/reset-password",
  validate(resetTokenSchema),
  AuthController.resetPassword
);

router.get("/refreshToken", AuthController.refreshToken);

router.delete("/logout", AuthController.logOut);

router.get("/search/:nid", AuthController.searchPatient);

router.get(
  "/doctor/pending",
  Auth.checkToken,
  Auth.checkAdminRole,
  AuthController.fetchPendingDoctors
);

router.put('/doctor/pending', Auth.checkToken, Auth.checkAdminRole, AuthController.approveDoctor)

router.get('/patient/:nid' , Auth.checkToken ,AuthController.fetchAllPatientData)

router.get("/profile", Auth.checkToken, AuthController.fetchUser);

export default router;
