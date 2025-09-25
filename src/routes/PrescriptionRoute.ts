import PrescriptionController from "../controllers/PrescriptionController";
import Auth from "../middleware/middleware";
import { RouteFactory } from "../utils/RouterFactory";

const router = RouteFactory.createCustomRoutes([
  { method: "post", path: "/create", handler: PrescriptionController.createPrescription, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "ed"])] },
  { method: "put", path: "/edit/:prescriptionId", handler: PrescriptionController.editPrescription, middleware: [Auth.checkToken] },
  { method: "get", path: "/:id", handler: PrescriptionController.fetchSinglePrescription, middleware: [Auth.checkToken] },
  { method: "get", path: "/doctor/:doctorId", handler: PrescriptionController.fetchManyPrescriptions, middleware: [Auth.checkToken, Auth.checkRoles(["doctor", "ed"])] },
  { method: "get", path: "/patient/:patientNid", handler: PrescriptionController.fetchManyPrescriptions, middleware: [Auth.checkToken] },
]);

export default router;
