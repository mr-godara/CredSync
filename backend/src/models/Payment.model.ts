import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  loan:        mongoose.Types.ObjectId; 
  recordedBy:  mongoose.Types.ObjectId; 
  utrNumber:   string;                  
  amount:      number;
  paymentDate: Date;
  createdAt:   Date;
  updatedAt:   Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loan:        { type: Schema.Types.ObjectId, ref: "LoanApplication", required: true },
    recordedBy:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber:   { type: String, required: true, unique: true, trim: true },
    amount:      { type: Number, required: true, min: 1 },
    paymentDate: { type: Date,   required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
