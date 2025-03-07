import { Router } from 'express';
import { getBusRoutes } from '../controllers/busController.js';

const busRouter = Router();

busRouter.route('/routes').get(getBusRoutes);

export default busRouter;
