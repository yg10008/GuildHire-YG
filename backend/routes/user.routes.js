import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateResume
} from "../controllers/user.controller.js";
import { verifyEmail } from "../controllers/email.controller.js";
import { authenticateUser } from "../middlewares/auth.js";
import { body } from "express-validator";
import express from "express";
import multer from "multer";
import { upload } from "../controllers/user.controller.js"; // Import from user.controller.js

const userRouter = express.Router();

// Multer error handling middleware
const handleMulterError = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      console.log('Other upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

userRouter.post(
  "/register",
  handleMulterError,
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("address").notEmpty().withMessage("Address is required"),
  registerUser
);

userRouter.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  loginUser
);


userRouter.get("/logout", authenticateUser, logoutUser);


userRouter.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Invalid email format"),
  forgotPassword
);


userRouter.post(
  "/reset-password/:token",
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  resetPassword
);


userRouter.get("/profile", authenticateUser, getUserProfile);

userRouter.get("/verify-email/:token", verifyEmail);

userRouter.put(
  "/update-resume",
  authenticateUser,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        // Multer error
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  updateResume
);

export default userRouter;