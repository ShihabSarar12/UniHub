import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
	createFoodItem,
	deleteFoodItem,
	editFoodItem,
	getFoodItems,
} from '../controllers/vendorController.js';

const vendorRouter = Router();

vendorRouter
	.route('/foodItem')
	.post(protect, createFoodItem)
	.get(protect, getFoodItems);

vendorRouter.route('/foodItem/:menuId').patch(protect, editFoodItem);

vendorRouter.route('/foodItem/:menuId').delete(protect, deleteFoodItem);
