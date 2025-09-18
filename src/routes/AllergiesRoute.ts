import express from "express";
import AllergiesController from "../controllers/AllergiesController";
import Auth from "../middleware/middleware";
import validate from "../Schemas/SchemaValidation";
import { AllergySchema } from "../Schemas/AllergySchema";

const router = express.Router();

router.get(
  "/:nid",
  Auth.checkToken,
  AllergiesController.getAllergiesForPatient
);

router.post(
  "/add",
  Auth.checkToken,
  validate(AllergySchema),
  AllergiesController.addAllergy
);

router.get(
  "/specific/:allergyText",
  Auth.checkToken,
  AllergiesController.getSpecificAllergy
);

router.delete(
  "/remove/:pallergyId",
  Auth.checkToken,
  AllergiesController.removePallergy
);

export default router;
