import {
    registerRecruiter,
    loginRecruiter,
    logoutRecruiter,
    getRecruiterProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/recruiter.controller.js';
import { verifyRecruiterEmail } from '../controllers/email.controller.js';
import { authenticateRecruiter } from '../middlewares/auth.js';
import { body } from 'express-validator';
import express from 'express';


const recruiterRouter = express.Router();

recruiterRouter.post(
    '/register',
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    registerRecruiter
);

recruiterRouter.post(
    '/login',
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    loginRecruiter
);

recruiterRouter.get('/logout', authenticateRecruiter, logoutRecruiter);
recruiterRouter.get('/profile', authenticateRecruiter, getRecruiterProfile);

recruiterRouter.post(
    '/forgot-password',
    body('email').isEmail().withMessage('Invalid email format'),
    forgotPassword
);

recruiterRouter.post(
    '/reset-password/:token',
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    resetPassword
);

recruiterRouter.get('/verify-email/:token', verifyRecruiterEmail);

export default recruiterRouter;