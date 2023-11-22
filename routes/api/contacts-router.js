import express from "express";
import moviesController from "../../controllers/contacts-controller.js";
import { isEmptyBody } from "../../middlewares/index.js";

const router = express.Router();

router.get("/", moviesController.getAll);

router.get("/:contactId", moviesController.getById);

router.post("/", isEmptyBody, moviesController.add);

router.put("/:contactId", isEmptyBody, moviesController.updateById);

router.delete("/:contactId", moviesController.deleteById);

export default router;
