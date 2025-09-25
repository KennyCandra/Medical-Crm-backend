
import DiseaseService from "../Services/DiseaseService";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
  { method: "get", path: "/search/:value", handler: DiseaseService.searchDisease },
]);

export default router;
