import express from "express";
import AuthController from "../controllers/AuthController";
import Auth from "../middleware/middleware";
import {
  RegisterPatientSchema,
  LoginSchema,
} from "../Schemas/RegisterSchema";
import validate from "../Schemas/SchemaValidation";
const router = express.Router();

router.post("/sign-up", validate(RegisterPatientSchema), AuthController.SignUp);

router.post("/login", validate(LoginSchema), AuthController.login);

// router.post("/forget-password", AuthController.forgetPassword); //to do later

// router.put(
//   "/reset-password",
//   validate(resetTokenSchema),
//   AuthController.resetPassword
// ); //to do later

router.get("/refreshToken", AuthController.refreshToken);

router.delete("/logout", AuthController.logOut);

router.get("/search/:nid", AuthController.searchPatient);

router.get(
  "/patient/:nid",
  Auth.checkToken,
  Auth.checkRoles(["doctor", "ed"]),
  AuthController.fetchAllPatientData
);

export default router;
