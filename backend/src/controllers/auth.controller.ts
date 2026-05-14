import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { AuthRequest } from "../middleware/auth.middleware";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      
    });

   
    const token = jwt.sign(
      {id:user._id,role:user.role},
      process.env.JWT_SECRET as string,
      {expiresIn:  (process.env.JWT_EXPIRES_IN || "7d") as any }  
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }


     const token = jwt.sign(
      {id:user._id,role:user.role},
      process.env.JWT_SECRET as string  ,
      {expiresIn:(process.env.JWT_EXPIRES_IN || "7d") as any}
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });


    res.status(200).json({
      message: "Login successful",
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
};



export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
