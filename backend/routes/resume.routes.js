import express from 'express';
import { body } from 'express-validator';
import {
  createResumeScore,
  getResumeScoreByApplication,
} from '../controllers/resumeScore.controller.js';
import { authenticateUser, authenticateRecruiter, authenticateAny } from '../middlewares/auth.js';

const resumeScoreRouter = express.Router();


const resumeScoreValidationRules = [
  body('applicationId')
    .notEmpty()
    .withMessage('Application ID is required')
    .isMongoId()
    .withMessage('Invalid Application ID'),
];


resumeScoreRouter.post('/', authenticateAny, resumeScoreValidationRules, createResumeScore);


resumeScoreRouter.get('/:applicationId', authenticateAny, getResumeScoreByApplication);

export default resumeScoreRouter;