import express from 'express';
import { body } from 'express-validator';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/job.controller.js';
import { authenticateRecruiter, authenticateUser } from '../middlewares/auth.js';

const jobRouter = express.Router();


const jobValidationRules = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('salary').isNumeric().withMessage('Salary must be a number').custom(value => value >= 0).withMessage('Salary cannot be negative'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),
  body('vacancies').isInt({ min: 1 }).withMessage('Vacancies must be at least 1'),
  body('status').isIn(['active', 'inactive', 'closed']).withMessage('Invalid status'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date').custom(value => new Date(value) > new Date()).withMessage('Deadline must be in the future'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('role').isIn(['Software Engineer', 'Data Scientist', 'Product Manager', 'Other']).withMessage('Invalid role'),
  body('experienceLevel').isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Other']).withMessage('Invalid experience level'),
];


jobRouter.post('/', authenticateRecruiter, jobValidationRules, createJob);


jobRouter.get('/', getAllJobs);


jobRouter.get('/:id', getJobById);


jobRouter.put('/:id', authenticateRecruiter, jobValidationRules, updateJob);


jobRouter.delete('/:id', authenticateRecruiter, deleteJob);

export default jobRouter;
