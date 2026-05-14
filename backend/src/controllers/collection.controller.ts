import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";
import { Payment } from "../models/Payment.model";

export const getDisbursedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await LoanApplication.find({ status: LoanStatus.DISBURSED })
      .populate("borrower", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: loans.length, loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !amount || !paymentDate) {
      res.status(400).json({ message: "UTR number, amount, and payment date are required" });
      return;
    }

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) {
      res.status(400).json({ message: "Payment amount must be greater than 0" });
      return;
    }

    const duplicateUTR = await Payment.findOne({ utrNumber });
    if (duplicateUTR) {
      res.status(409).json({ message: "UTR number already exists. Duplicate payments are not allowed." });
      return;
    }

    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== LoanStatus.DISBURSED) {
      res.status(400).json({ message: `Cannot record payment for a loan with status: ${loan.status}` });
      return;
    }

    // --- Early Repayment Logic ---
    // Calculate days elapsed since the loan was created (proxy for disbursement date)
    const paymentDateObj = new Date(paymentDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(1, Math.ceil((paymentDateObj.getTime() - new Date(loan.createdAt).getTime()) / msPerDay));
    
    // Calculate actual interest accrued up to this payment date
    // Daily interest = (Principal * Rate) / (100 * 365)
    const actualInterest = (loan.loanAmount * loan.interestRate * Math.min(daysElapsed, loan.tenure)) / (100 * 365);
    
    // The amount required to completely close the loan TODAY
    const earlyPayoffAmount = Math.max(0, (loan.loanAmount + actualInterest) - loan.amountPaid);

    let finalPaymentAmount = paymentAmount;
    let isClosingEarly = false;
    let waivedInterest = 0;

    // Check if the user is paying enough to close the loan early
    if (daysElapsed < loan.tenure && paymentAmount >= earlyPayoffAmount) {
      // User is closing early! We only charge the earlyPayoffAmount.
      finalPaymentAmount = earlyPayoffAmount;
      isClosingEarly = true;
      
      // Calculate how much interest we are waiving
      waivedInterest = loan.simpleInterest - actualInterest;
      
      // Adjust the total repayment expectation downwards so books balance
      loan.totalRepayment -= waivedInterest;
      loan.simpleInterest = actualInterest;
    }

    if (finalPaymentAmount > loan.outstandingBalance) {
      res.status(400).json({
        message: `Payment amount (₹${finalPaymentAmount}) exceeds outstanding balance (₹${loan.outstandingBalance})`,
      });
      return;
    }

    const payment = await Payment.create({
      loan:        loan._id,
      recordedBy:  req.user?.id,
      utrNumber,
      amount:      finalPaymentAmount,
      paymentDate: paymentDateObj,
    });

    loan.amountPaid         = parseFloat((loan.amountPaid + finalPaymentAmount).toFixed(2));
    loan.outstandingBalance = parseFloat((loan.totalRepayment - loan.amountPaid).toFixed(2));

    if (loan.outstandingBalance <= 0 || isClosingEarly) {
      loan.status             = LoanStatus.CLOSED;
      loan.outstandingBalance = 0;
    }

    await loan.save();

    res.status(201).json({
      message: loan.status === LoanStatus.CLOSED
        ? "Payment recorded. Loan is now CLOSED."
        : "Payment recorded successfully",
      payment,
      loanStatus:         loan.status,
      amountPaid:         loan.amountPaid,
      outstandingBalance: loan.outstandingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getLoanPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({ loan: req.params.id })
      .populate("recordedBy", "name")
      .sort({ paymentDate: -1 });

    res.status(200).json({ total: payments.length, payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
