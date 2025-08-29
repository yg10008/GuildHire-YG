import userModel from '../models/user.model.js';
import RecruiterModel from '../models/recruiter.model.js';


export const verifyEmail = async (req, res) => {
    try {
        const user = await userModel.findOne({ emailVerificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token or email' });
        }
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const verifyRecruiterEmail = async (req, res) => {
    try {
        const recruiter = await RecruiterModel.findOne({ emailVerificationToken: req.params.token });
        if (!recruiter) {
            return res.status(400).json({ message: 'Invalid token or email' });
        }
        recruiter.isVerified = true;
        recruiter.emailVerificationToken = undefined;
        await recruiter.save();
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
