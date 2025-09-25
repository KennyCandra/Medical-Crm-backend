
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";
import AllergyService from "../Services/AllergyService";

const router = RouteFactory.createCustomRoutes([
  { method: "get", path: "/:nid", handler: AllergyService.getAllergiesForPatient, middleware: [Auth.checkToken] },
  { method: "post", path: "/add", handler: AllergyService.addAllergy, middleware: [Auth.checkToken] },
  { method: "get", path: "/search/:value", handler: AllergyService.fetchAllergy, middleware: [Auth.checkToken] },
  { method: "delete", path: "/remove/:pallergyId ", handler: AllergyService.removePallergy, middleware: [Auth.checkToken] },
]);


export default router;
