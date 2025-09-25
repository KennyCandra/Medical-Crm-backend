import specialization from "../controllers/specializationController";
import { RouteFactory } from "../utils/RouterFactory";


const router = RouteFactory.createCustomRoutes([
    { method: "get", path: "/", handler: specialization.fetchAll },
])

export default router