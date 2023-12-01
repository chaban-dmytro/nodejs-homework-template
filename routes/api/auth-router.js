import express from "express";
import authController from "../../controllers/auth-controller.js";
import { isEmptyBody, authenticate } from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/signup", isEmptyBody, authController.signUp);
authRouter.post("/signin", isEmptyBody, authController.signIn);
authRouter.post("/signout", authenticate, authController.signOut);
authRouter.get("/current", authenticate, authController.getCurrent);
authRouter.patch("/subupdate", authenticate, authController.subUpdate);

export default authRouter;
