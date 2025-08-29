import express from 'express';
import jwt from 'jsonwebtoken';
import BlacklistToken from '../models/blacklistToken.model.js';
import UserModel from '../models/user.model.js';
import RecruiterModel from '../models/recruiter.model.js';

export const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    req.recruiter = null; // Clear recruiter
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const authenticateRecruiter = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized...." });

    const recruiter = await RecruiterModel.findById(decoded._id);
    if (!recruiter) {
      return res.status(401).json({ message: "Unauthorizedddd" });
    }

    req.recruiter = recruiter;
    req.user = null; // Clear user
    next();
  } catch (error) {
    console.error('Error authenticating recruiter:', error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const authenticateAny = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted) {
      console.log('Token is blacklisted:', token);
      return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    if (decoded.model === 'User') {
      const user = await UserModel.findById(decoded._id);
      if (!user) {
        console.log('User not found:', decoded._id);
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }
      req.user = user;
      req.recruiter = null; // Clear recruiter
      console.log('Set req.user:', { _id: user._id, email: user.email });
    } else if (decoded.model === 'Recruiter') {
      const recruiter = await RecruiterModel.findById(decoded._id);
      if (!recruiter) {
        console.log('Recruiter not found:', decoded._id);
        return res.status(401).json({ message: 'Unauthorized: Recruiter not found' });
      }
      req.recruiter = recruiter;
      req.user = null; // Clear user
      console.log('Set req.recruiter:', { _id: recruiter._id, email: recruiter.email });
    } else {
      console.log('Invalid model in JWT:', decoded.model);
      return res.status(401).json({ message: 'Unauthorized: Invalid model' });
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: `Unauthorized: Invalid token - ${error.message}` });
  }
};