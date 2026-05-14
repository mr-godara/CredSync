import { Router } from "express";
import { getDisbursedLoans, recordPayment, getLoanPayments } from "../controllers/collection.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.use(verifyToken, authorizeRoles(Role.COLLECTION, Role.ADMIN));

router.get("/loans",                      getDisbursedLoans);
router.post("/loans/:id/payment",         recordPayment);
router.get("/loans/:id/payments",         getLoanPayments);

export default router;
