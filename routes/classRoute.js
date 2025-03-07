import { Router } from 'express';
import { getRoutine } from '../controllers/classController.js';

const classRouter = Router();

classRouter.route('/routine').get(getRoutine);

export default classRouter;
