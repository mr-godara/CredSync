import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User.model";
import { LoanApplication } from "../models/LoanApplication.model";

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appliedBorrowerIds = await LoanApplication.distinct("borrower");

    const leads = await User.find({
      role: "BORROWER",
      _id: { $nin: appliedBorrowerIds },
    }).select("-password");

    res.status(200).json({ total: leads.length, leads });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
