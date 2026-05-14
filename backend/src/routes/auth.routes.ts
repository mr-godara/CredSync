import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login",    login);
router.post("/logout",   logout);

// Protected — must be logged in
router.get("/me", verifyToken, getMe);

export default router;
