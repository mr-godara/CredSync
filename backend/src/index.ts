import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./db";
import path from "path";
import authRoutes         from "./routes/auth.routes";
import borrowerRoutes     from "./routes/borrower.routes";
import salesRoutes        from "./routes/sales.routes";
import sanctionRoutes     from "./routes/sanction.routes";
import disbursementRoutes from "./routes/disbursement.routes";
import collectionRoutes   from "./routes/collection.routes";
import adminRoutes        from "./routes/admin.routes";
import { setupSwagger }   from "./swagger";

dotenv.config();

const app = express(); // trigger restart

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth",         authRoutes);
app.use("/api/borrower",     borrowerRoutes);
app.use("/api/sales",        salesRoutes);
app.use("/api/sanction",     sanctionRoutes);
app.use("/api/disbursement", disbursementRoutes);
app.use("/api/collection",   collectionRoutes);
app.use("/api/admin",        adminRoutes);

setupSwagger(app);

async function StartServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

StartServer();
