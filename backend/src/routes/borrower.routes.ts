import { Router } from "express";
import {
  savePersonalDetails,
  uploadSalarySlip,
  applyLoan,
  getMyLoans,
} from "../controllers/borrower.controller";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware";
import upload from "../middleware/multer.middleware";
import { Role } from "../models/User.model";

const router = Router();

// All borrower routes require login and BORROWER role
router.use(verifyToken, authorizeRoles(Role.BORROWER));

router.post("/personal-details", savePersonalDetails);
router.post("/upload-slip",      upload.single("salarySlip"), uploadSalarySlip);
router.post("/apply",            applyLoan);
router.get("/my-loans",          getMyLoans);

export default router;
