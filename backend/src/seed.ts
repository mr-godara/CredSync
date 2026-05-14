import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Role } from "./models/User.model";

dotenv.config();

const seedUsers = [
  { name: "Admin User",         email: "admin@lms.com",        password: "Admin@123",    role: Role.ADMIN },
  { name: "Sales Executive",    email: "sales@lms.com",        password: "Sales@123",    role: Role.SALES },
  { name: "Sanction Executive", email: "sanction@lms.com",     password: "Sanction@123", role: Role.SANCTION },
  { name: "Disbursement Exec",  email: "disbursement@lms.com", password: "Disburse@123", role: Role.DISBURSEMENT },
  { name: "Collection Exec",    email: "collection@lms.com",   password: "Collect@123",  role: Role.COLLECTION },
  { name: "Test Borrower",      email: "borrower@lms.com",     password: "Borrow@123",   role: Role.BORROWER },
];

async function seed() {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      console.error("MONGO_URI not set in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("Connected to database");

    for (const seedUser of seedUsers) {
      const existing = await User.findOne({ email: seedUser.email });
      if (existing) {
        console.log(`Skipped (already exists): ${seedUser.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(seedUser.password, 10);
      await User.create({ ...seedUser, password: hashedPassword });
      console.log(`Created [${seedUser.role}]: ${seedUser.email}`);
    }

    console.log("\nSeed complete. Login credentials:");
    console.log("─────────────────────────────────────────────");
    seedUsers.forEach(u => {
      console.log(`${u.role.padEnd(14)} | ${u.email.padEnd(28)} | ${u.password}`);
    });
    console.log("─────────────────────────────────────────────");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
