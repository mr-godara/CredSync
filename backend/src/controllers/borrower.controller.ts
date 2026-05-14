import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { User, EmploymentMode } from "../models/User.model";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";

function isValidPAN(pan: string): boolean {
  if (pan.length !== 10) return false;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits  = "0123456789";

  for (let i = 0; i < 5; i++) {
    if (!letters.includes(pan[i])) return false;
  }
  for (let i = 5; i < 9; i++) {
    if (!digits.includes(pan[i])) return false;
  }
  if (!letters.includes(pan[9])) return false;

  return true;
}

interface BREInput {
  pan: string;
  dob: string;
  monthlyIncome: number;
  employmentMode: EmploymentMode;
}

interface BREResult {
  passed: boolean;
  reason?: string;
}

function runBRE({ pan, dob, monthlyIncome, employmentMode }: BREInput): BREResult {
  if (!isValidPAN(pan.toUpperCase())) {
    return { passed: false, reason: "Invalid PAN format. Expected format: ABCDE1234F" };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 23 || age > 50) {
    return { passed: false, reason: `Age must be between 23 and 50. Your age: ${age}` };
  }

  if (monthlyIncome < 25000) {
    return { passed: false, reason: "Monthly income must be at least ₹25,000" };
  }

  if (employmentMode === EmploymentMode.UNEMPLOYED) {
    return { passed: false, reason: "Unemployed applicants are not eligible for a loan" };
  }

  return { passed: true };
}

export const savePersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pan, dob, monthlyIncome, employmentMode } = req.body;

    if (!pan || !dob || !monthlyIncome || !employmentMode) {
      res.status(400).json({ message: "All personal details are required" });
      return;
    }

    const breResult = runBRE({
      pan: pan.toString().toUpperCase(),
      dob,
      monthlyIncome: Number(monthlyIncome),
      employmentMode,
    });

    if (!breResult.passed) {
      res.status(422).json({ message: "Eligibility check failed", reason: breResult.reason });
      return;
    }

    await User.findByIdAndUpdate(req.user?.id, {
      pan: pan.toUpperCase(),
      dob: new Date(dob),
      monthlyIncome: Number(monthlyIncome),
      employmentMode,
    });

    res.status(200).json({ message: "Personal details saved. BRE passed." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Salary slip file is required" });
      return;
    }

    const salarySlipUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user?.id, { salarySlipUrl });

    res.status(200).json({ message: "Salary slip uploaded successfully", salarySlipUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanAmount, tenure } = req.body;

    if (!loanAmount || !tenure) {
      res.status(400).json({ message: "Loan amount and tenure are required" });
      return;
    }

    const amount = Number(loanAmount);
    const days   = Number(tenure);

    if (amount < 50000 || amount > 500000) {
      res.status(400).json({ message: "Loan amount must be between ₹50,000 and ₹5,00,000" });
      return;
    }
    if (days < 30 || days > 365) {
      res.status(400).json({ message: "Tenure must be between 30 and 365 days" });
      return;
    }

    const borrower = await User.findById(req.user?.id);
    if (!borrower) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!borrower.pan || !borrower.dob || !borrower.monthlyIncome || !borrower.employmentMode || !borrower.salarySlipUrl) {
      res.status(400).json({ message: "Complete steps 2 and 3 before applying" });
      return;
    }

    const existingLoan = await LoanApplication.findOne({
      borrower: borrower._id,
      status: { $in: [LoanStatus.APPLIED, LoanStatus.SANCTIONED, LoanStatus.DISBURSED] },
    });
    if (existingLoan) {
      res.status(409).json({ message: "You already have an active loan application" });
      return;
    }

    const interestRate    = 12;
    const simpleInterest  = (amount * interestRate * days) / (365 * 100);
    const totalRepayment  = amount + simpleInterest;

    const loan = await LoanApplication.create({
      borrower:           borrower._id,
      pan:                borrower.pan,
      dob:                borrower.dob,
      monthlyIncome:      borrower.monthlyIncome,
      employmentMode:     borrower.employmentMode,
      salarySlipUrl:      borrower.salarySlipUrl,
      loanAmount:         amount,
      tenure:             days,
      interestRate,
      simpleInterest:     parseFloat(simpleInterest.toFixed(2)),
      totalRepayment:     parseFloat(totalRepayment.toFixed(2)),
      outstandingBalance: parseFloat(totalRepayment.toFixed(2)),
      status:             LoanStatus.APPLIED,
    });

    res.status(201).json({ message: "Loan application submitted successfully", loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await LoanApplication.find({ borrower: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
