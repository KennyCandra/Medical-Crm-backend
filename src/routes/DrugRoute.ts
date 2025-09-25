
import DrugServices from "../Services/DrugServices";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";


const router = RouteFactory.createCustomRoutes([
  { method: "post", path: "/interaction", handler: DrugServices.getInteractions, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "admin"])] },
  { method: "get", path: "/search/:value", handler: DrugServices.searchDrug, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "admin"])] },
]);

export default router;
