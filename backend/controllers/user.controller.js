import UserModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import BlacklistToken from '../models/blacklistToken.model.js';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import url from 'url';

dotenv.config();

const storage = multer.diskStorage({
  destination: 'uploads/resumes/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 1024 * 1024 * 5 }
}).single('resume');

export const registerUser = async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: req.body,
      file: req.file ? 'File uploaded' : 'No file',
      headers: req.headers['content-type']
    });

    if (!req.file) {
      console.log('No resume file provided');
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;
    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new UserModel({
      name,
      email,
      password,
      phone,
      address,
      resume: resumeUrl,
      role: 'job_seeker',
      isVerified: false,
      emailVerificationToken,
    });

    await newUser.save();

    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/users/verify-email/${emailVerificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"JobSphere" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Hello ${name},</p>
        <p>Please click the following link to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    const token = newUser.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    res.status(201).json({
      message: 'User registered successfully and verification email sent',
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    // Generate a token
    const token = user.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      maxAge: 3600000, // 1 hour
    });

    // Send the token in the response
    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  }
  catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const logoutUser = async (req, res) => {
  try {
    // Try to get token from Authorization header or cookie
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // req.user may not be set if using only cookies, so decode token if needed
    let userId = req.user?._id;
    if (!userId) {
      const jwt = (await import('jsonwebtoken')).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    const blacklistedToken = new BlacklistToken({
      token, userId,
      userType: 'User', // Assuming the user type is 'User'
    });
    await blacklistedToken.save();

    res.clearCookie('token');

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }
  catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate a reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create a reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/users/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: message,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  }
  catch (error) {
    console.error('Error sending reset password email:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;
  const resetToken = req.params.token;

  try {
    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  }
  catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const updateResume = async (req, res) => {
  console.log('Received file:', req.file);
  console.log('Request user:', req.user);
  console.log('Request body:', req.body);
  try {
    console.log('Updating resume for user:', req.user._id);
    // Check if the user is authenticated
    if (!req.user) {
      console.log('User not authenticated');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete the old resume file if it exists
    if (user.resume) {
      const oldResumeUrl = user.resume;
      const oldResumePath = path.join(
        'uploads/resumes',
        path.basename(url.parse(oldResumeUrl).pathname)
      );
      if (fs.existsSync(oldResumePath)) {
        console.log(`Deleting old resume file: ${oldResumePath}`);
        fs.unlinkSync(oldResumePath);
      } else {
        console.log(`Old resume file not found: ${oldResumePath}`);
      }
    }

    // Update resume URL
    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;
    user.resume = resumeUrl;
    await user.save();

    res.status(200).json({ message: 'Resume updated successfully', resume: resumeUrl });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Failed to update resume', error: error.message });
  }
};