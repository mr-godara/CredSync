import mongoose, { Document, Schema } from "mongoose";

export enum Role {
  ADMIN        = "ADMIN",
  SALES        = "SALES",
  SANCTION     = "SANCTION",
  DISBURSEMENT = "DISBURSEMENT",
  COLLECTION   = "COLLECTION",
  BORROWER     = "BORROWER",
}

export enum EmploymentMode {
  SALARIED      = "SALARIED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  UNEMPLOYED    = "UNEMPLOYED",
}

export interface IUser extends Document {
  name:           string;
  email:          string;
  password:       string;
  role:           Role;
  pan?:           string;
  dob?:           Date;
  monthlyIncome?: number;
  employmentMode?:EmploymentMode;
  salarySlipUrl?: string;
  createdAt:      Date;
  updatedAt:      Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true },
    role:          { type: String, enum: Object.values(Role), default: Role.BORROWER },
    pan:           { type: String, trim: true, uppercase: true, default: null },
    dob:           { type: Date, default: null },
    monthlyIncome: { type: Number, default: null },
    employmentMode:{ type: String, enum: Object.values(EmploymentMode), default: null },
    salarySlipUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

