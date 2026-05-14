import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";

export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await LoanApplication.find({ status: LoanStatus.APPLIED })
      .populate("borrower", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: loans.length, loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const approveLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: `Cannot approve a loan with status: ${loan.status}` });
      return;
    }

    loan.status       = LoanStatus.SANCTIONED;
    loan.sanctionedBy = req.user?.id as any;
    await loan.save();

    res.status(200).json({ message: "Loan sanctioned successfully", loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ message: "Rejection reason is required" });
      return;
    }

    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: `Cannot reject a loan with status: ${loan.status}` });
      return;
    }

    loan.status          = LoanStatus.REJECTED;
    loan.rejectionReason = reason;
    await loan.save();

    res.status(200).json({ message: "Loan rejected", loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
