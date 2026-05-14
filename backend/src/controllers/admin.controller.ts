import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth.middleware";
import { User, Role } from "../models/User.model";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";
import { Payment } from "../models/Payment.model";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "name, email, password and role are required" });
      return;
    }

    const validRoles = Object.values(Role);
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: `Invalid role. Valid roles: ${validRoles.join(", ")}` });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: Record<string, string> = {};
    if (status && Object.values(LoanStatus).includes(status as LoanStatus)) {
      filter.status = status as string;
    }

    const loans = await LoanApplication.find(filter)
      .populate("borrower", "name email")
      .populate("sanctionedBy", "name")
      .populate("disbursedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: loans.length, loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalBorrowers,
      totalLoans,
      appliedCount,
      sanctionedCount,
      disbursedCount,
      closedCount,
      rejectedCount,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: Role.BORROWER }),
      LoanApplication.countDocuments(),
      LoanApplication.countDocuments({ status: LoanStatus.APPLIED }),
      LoanApplication.countDocuments({ status: LoanStatus.SANCTIONED }),
      LoanApplication.countDocuments({ status: LoanStatus.DISBURSED }),
      LoanApplication.countDocuments({ status: LoanStatus.CLOSED }),
      LoanApplication.countDocuments({ status: LoanStatus.REJECTED }),
      Payment.countDocuments(),
    ]);

    const amountAgg = await LoanApplication.aggregate([
      { $group: { _id: null, totalDisbursed: { $sum: "$loanAmount" }, totalRepayable: { $sum: "$totalRepayment" } } },
    ]);

    const amountStats = amountAgg[0] || { totalDisbursed: 0, totalRepayable: 0 };

    res.status(200).json({
      users:   { total: totalUsers, borrowers: totalBorrowers },
      loans:   { total: totalLoans, applied: appliedCount, sanctioned: sanctionedCount, disbursed: disbursedCount, closed: closedCount, rejected: rejectedCount },
      finance: { totalDisbursed: amountStats.totalDisbursed, totalRepayable: amountStats.totalRepayable },
      payments: { total: totalPayments },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
