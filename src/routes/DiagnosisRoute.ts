
import DiganosisService from "../Services/DiganosisService";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
  { method: "post", path: "/create", handler: DiganosisService.createDiagnosis, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "admin"])] },
  { method: "get", path: "/:nid", handler: DiganosisService.fetchForPatient, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "admin"])] },
  { method: "delete", path: "/remove/:id", handler: DiganosisService.removeDiagnosis },
]);


export default router;
