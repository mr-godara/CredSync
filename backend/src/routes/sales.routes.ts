import { Router } from "express";
import { getLeads } from "../controllers/sales.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.use(verifyToken, authorizeRoles(Role.SALES, Role.ADMIN));

router.get("/leads", getLeads);

export default router;
