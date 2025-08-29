import RecruiterModel from '../models/recruiter.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import BlacklistToken from '../models/blacklistToken.model.js';
import nodemailer from 'nodemailer';

export const registerRecruiter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone, companyName, address } = req.body;

    try {
        // Check if recruiter already exists
        const existingRecruiter = await RecruiterModel.findOne({ email });
        if (existingRecruiter) {
            return res.status(400).json({ message: 'A recruiter with this email already exists' });
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Create a new recruiter
        const newRecruiter = new RecruiterModel({
            name,
            email,
            password,
            phone,
            companyName,
            address,
            role: 'recruiter',
            isVerified: false,
            emailVerificationToken,
        });

        // Save the recruiter to the database
        await newRecruiter.save();

        const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/recruiters/verify-email/${emailVerificationToken}`;
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

        // Generate a token
        const token = newRecruiter.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(201).json({ message: 'Recruiter registered successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const loginRecruiter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    try {
        // Check if recruiter exists
        const recruiter = await RecruiterModel.findOne({ email: normalizedEmail }).select('+password');
        if (!recruiter) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isMatch = await recruiter.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!recruiter.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }

        // Generate a token
        const token = recruiter.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({
            message: 'Recruiter logged in successfully', token,
            recruiter: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                phone: recruiter.phone,
                companyName: recruiter.companyName,
                address: recruiter.address,
                role: recruiter.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const logoutRecruiter = async (req, res) => {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }


        const blacklistedToken = new BlacklistToken({
            token,
            userId: req.recruiter._id,
            userType: "Recruiter", // Specify the model type
        });
        await blacklistedToken.save();

        res.clearCookie('token');
        res.status(200).json({ message: 'Recruiter logged out successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getRecruiterProfile = async (req, res) => {
    try {
        const recruiter = await RecruiterModel.findById(req.recruiter._id).select('-password');
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        res.status(200).json({
            id: recruiter._id,
            name: recruiter.name,
            email: recruiter.email,
            phone: recruiter.phone,
            companyName: recruiter.companyName,
            address: recruiter.address,
            role: recruiter.role,
        });
    } catch (error) {
        console.error(error);
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
        // Check if recruiter exists
        const recruiter = await RecruiterModel.findOne({ email });
        if (!recruiter) {
            return res.status(400).json({ message: 'No recruiter found with this email' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        recruiter.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        recruiter.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await recruiter.save();

        // Send email with reset token
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `${req.protocol}://${req.get('host')}/recruiters/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
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
        const recruiter = await RecruiterModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!recruiter) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password
        recruiter.password = password;
        recruiter.resetPasswordToken = undefined;
        recruiter.resetPasswordExpire = undefined;

        await recruiter.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
