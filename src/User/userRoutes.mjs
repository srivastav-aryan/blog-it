import express from "express";
import { logInUser, registerUser , logoutUser} from "./userControllers.mjs";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", logInUser);

router.get("/logout" , logoutUser)
export default router;
