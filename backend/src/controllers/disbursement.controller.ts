import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";

export const getSanctionedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await LoanApplication.find({ status: LoanStatus.SANCTIONED })
      .populate("borrower", "name email")
      .populate("sanctionedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: loans.length, loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== LoanStatus.SANCTIONED) {
      res.status(400).json({ message: `Cannot disburse a loan with status: ${loan.status}` });
      return;
    }

    loan.status      = LoanStatus.DISBURSED;
    loan.disbursedBy = req.user?.id as any;
    await loan.save();

    res.status(200).json({ message: "Loan disbursed successfully", loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
