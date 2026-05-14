import { Router } from "express";
import { getAppliedLoans, approveLoan, rejectLoan } from "../controllers/sanction.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.use(verifyToken, authorizeRoles(Role.SANCTION, Role.ADMIN));

router.get("/loans",                 getAppliedLoans);
router.patch("/loans/:id/approve",   approveLoan);
router.patch("/loans/:id/reject",    rejectLoan);

export default router;
