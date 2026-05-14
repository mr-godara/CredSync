import { Router } from "express";
import { getSanctionedLoans, disburseLoan } from "../controllers/disbursement.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.use(verifyToken, authorizeRoles(Role.DISBURSEMENT, Role.ADMIN));

router.get("/loans",                  getSanctionedLoans);
router.patch("/loans/:id/disburse",   disburseLoan);

export default router;
