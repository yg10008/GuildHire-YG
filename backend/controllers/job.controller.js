import JobModel from '../models/job.model.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';



dotenv.config();

export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, salary, jobType, vacancies, status, deadline, skills, location, role, experienceLevel } = req.body;

  try {
    const newJob = new JobModel({
      title,
      description,
      salary,
      jobType,
      vacancies,
      status,
      deadline,
      recruiterId: req.recruiter._id,
      skills,
      location,
      role,
      experienceLevel,
    });

    await newJob.save();
    await newJob.populate('recruiterId', 'name email');

    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    const { status = 'active', location, jobType, role, recruiterId, page = 1, limit = 10 } = req.query;
    const query = {};

    
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (role) query.role = role;
    if (recruiterId) query._id = recruiterId;
    
    const jobs = await JobModel.find(query)
      .populate('recruiterId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await JobModel.countDocuments(query);

    res.status(200).json({
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

export const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobModel.findById(id)
      .populate('recruiterId', 'name email')
      .populate('applications');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Optionally restrict to active jobs for job seekers
    if (req.user && job.status !== 'active') {
      return res.status(403).json({ message: 'This job is not active' });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
};

export const updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, description, salary, jobType, vacancies, status, deadline, skills, location, role, experienceLevel } = req.body;

  try {
    const job = await JobModel.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.recruiter._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    const updatedJob = await JobModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        salary,
        jobType,
        vacancies,
        status,
        deadline,
        skills,
        location,
        role,
        experienceLevel,
      },
      { new: true, runValidators: true }
    ).populate('recruiterId', 'name email');

    res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobModel.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.recruiter._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    await JobModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

