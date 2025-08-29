import ApplicationModel from '../models/application.model.js';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import UserModel from '../models/user.model.js';
import JobModel from '../models/job.model.js';
import ResumeModel from '../models/resumeScore.model.js';

dotenv.config();

export const createApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { job } = req.body;

  try {
    const newApplication = new ApplicationModel({
      job,
      user: req.user._id,
    });

    await newApplication.save();
    await newApplication.populate('job', 'title description');
    await newApplication.populate('user', 'name email resume');

    res.status(201).json({ message: 'Application created successfully', application: newApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    if (error.code === 11000) { 
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    res.status(500).json({ message: 'Failed to create application', error: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    console.log(req.query)
    const { jobId, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (jobId) {
      const job = await JobModel.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      if (job.recruiterId.toString() !== req.recruiter._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to view applications for this job' });
      }
      query.job = jobId;
    } else {
      const recruiterJobs = await JobModel.find({ recruiterId: req.recruiter._id }).select('_id');
      query.job = { $in: recruiterJobs.map(job => job._id) };
    }
    if (status) query.status = status;

    const applications = await ApplicationModel.find(query)
      .populate({
        path: 'job',
        select: 'title description recruiterId',
        populate: {
          path: 'recruiterId',
          model: 'Recruiter',
          select: 'name email companyName'
        }
      })
      .populate('user', 'name email resume')
      .populate('resumeScore')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ApplicationModel.countDocuments(query);

    res.status(200).json({
      message: 'Applications retrieved successfully',
      applications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error retrieving applications:', error);
    res.status(500).json({ message: 'Failed to retrieve applications', error: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await ApplicationModel.findById(applicationId)
      .populate({
        path: 'job',
        select: 'title description recruiterId',
        populate: {
          path: 'recruiterId',
          model: 'Recruiter',
          select: 'name email companyName'
        }
      })
      .populate('user', 'name email resume')
      .populate('resumeScore');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

  
    const job = await JobModel.findById(application.job);
    const isUser = req.user && application.user._id.toString() === req.user._id.toString();
    const isRecruiter = req.recruiter && job.recruiterId.toString() === req.recruiter._id.toString();
    if (!isUser && !isRecruiter) {
      return res.status(403).json({ message: 'Unauthorized to view this application' });
    }

    res.status(200).json({ message: 'Application retrieved successfully', application });
  } catch (error) {
    console.error('Error retrieving application:', error);
    res.status(500).json({ message: 'Failed to retrieve application', error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await JobModel.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.recruiter._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'Cannot update application for a job that is not active' });
    }

    if (status === 'hired' && application.status !== 'hired'){
      if (job.vacancies <= 0) {
        return res.status(400).json({ message: 'No vacancies available for this job' });
      }

      await JobModel.findByIdAndUpdate(
        job._id,
        { $inc: { vacancies: -1 } },
        { new: true, runValidators: true }
      );
    }

    if (job.vacancies <= 0) {
      await JobModel.findByIdAndUpdate(
        job._id,
        { status: 'closed' },
        { new: true, runValidators: true }
      );
    }

    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('job', 'title description')
      .populate('user', 'name email resume')
      .populate('resumeScore');

    res.status(200).json({ message: 'Application status updated successfully', application: updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }


    const job = await JobModel.findById(application.job);
    const isUser = req.user && application.user._id.toString() === req.user._id.toString();
    const isRecruiter = req.recruiter && job.recruiterId.toString() === req.recruiter._id.toString();
    if (!isUser && !isRecruiter) {
      return res.status(403).json({ message: 'Unauthorized to delete this application' });
    }

    await ApplicationModel.findByIdAndDelete(applicationId);
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Failed to delete application', error: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    const applications = await ApplicationModel.find(query)
      .populate({
        path: 'job',
        select: 'title description recruiterId',
        populate: {
          path: 'recruiterId',
          model: 'Recruiter',
          select: 'name email companyName'
        }
      })
      .populate('resumeScore')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ApplicationModel.countDocuments(query);

    res.status(200).json({
      message: 'User applications retrieved successfully',
      applications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error retrieving user applications:', error);
    res.status(500).json({ message: 'Failed to retrieve user applications', error: error.message });
  }
};