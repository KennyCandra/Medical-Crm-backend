
import AuthController from "../controllers/AuthController";
import Auth from "../middleware/middleware";
// import Auth from "../middleware/middleware";
import {
  RegisterPatientSchema,
  LoginSchema,
} from "../Schemas/RegisterSchema";
import validate from "../Schemas/SchemaValidation";
import { RouteFactory } from "../utils/RouterFactory";
const router = RouteFactory.createCustomRoutes([
  { method: "post", path: "/sign-up", handler: AuthController.SignUp, middleware: [validate(RegisterPatientSchema)] },
  { method: "post", path: "/login", handler: AuthController.login, middleware: [validate(LoginSchema)] },
  { method: "get", path: "/refreshToken", handler: AuthController.refreshToken },
  { method: "delete", path: "/logout", handler: AuthController.logOut },
  { method: "get", path: "/search/:nid", handler: AuthController.searchPatient, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "ed"])] },
  { method: "get", path: "/patient/:nid", handler: AuthController.fetchAllPatientData, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "ed"])] },
]);



// router.post("/forget-password", AuthController.forgetPassword); //to do later

// router.put(
//   "/reset-password",
//   validate(resetTokenSchema),
//   AuthController.resetPassword
// ); //to do later

export default router;
