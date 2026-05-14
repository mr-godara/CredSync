import mongoose, { Document, Schema } from "mongoose";
import { EmploymentMode } from "./User.model";



export enum LoanStatus {
  APPLIED    = "APPLIED",
  SANCTIONED = "SANCTIONED",
  DISBURSED  = "DISBURSED",
  CLOSED     = "CLOSED",
  REJECTED   = "REJECTED",
}


export interface ILoanApplication extends Document {
  borrower:           mongoose.Types.ObjectId;  
  pan:                string;
  dob:                Date;
  monthlyIncome:      number;
  employmentMode:     EmploymentMode;
  salarySlipUrl:      string;

  
  loanAmount:         number;   
  tenure:             number;   
  interestRate:       number;   
  simpleInterest:     number;  
  totalRepayment:     number;   

 
  status:             LoanStatus;
  rejectionReason?:   string;
  sanctionedBy?:      mongoose.Types.ObjectId;  
  disbursedBy?:       mongoose.Types.ObjectId;  
  amountPaid:         number;
  outstandingBalance: number;  
  createdAt:          Date;
  updatedAt:          Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    borrower:           { type: Schema.Types.ObjectId, ref: "User", required: true },

    pan:               { type: String, required: true, uppercase: true, trim: true },
    dob:               { type: Date,   required: true },
    monthlyIncome:     { type: Number, required: true },
    employmentMode:    { type: String, enum: Object.values(EmploymentMode), required: true },
    salarySlipUrl:     { type: String, required: true },

    loanAmount:        { type: Number, required: true },
    tenure:            { type: Number, required: true },
    interestRate:      { type: Number, default: 12 },
    simpleInterest:    { type: Number, required: true },
    totalRepayment:    { type: Number, required: true },

    status:            { type: String, enum: Object.values(LoanStatus), default: LoanStatus.APPLIED },
    rejectionReason:   { type: String, default: null },
    sanctionedBy:      { type: Schema.Types.ObjectId, ref: "User", default: null },
    disbursedBy:       { type: Schema.Types.ObjectId, ref: "User", default: null },

    amountPaid:         { type: Number, default: 0 },
    outstandingBalance: { type: Number, required: true },
  },
  { timestamps: true }
);

export const LoanApplication = mongoose.model<ILoanApplication>(
  "LoanApplication",
  LoanApplicationSchema
);
