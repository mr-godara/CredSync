import { Router } from "express";
import {
  createUser,
  getAllUsers,
  deleteUser,
  getAllLoans,
  getStats,
} from "../controllers/admin.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.use(verifyToken, authorizeRoles(Role.ADMIN));

router.post("/users",         createUser);
router.get("/users",          getAllUsers);
router.delete("/users/:id",   deleteUser);
router.get("/loans",          getAllLoans);
router.get("/stats",          getStats);

export default router;
