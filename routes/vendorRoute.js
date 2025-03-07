import { Router } from 'express';
import {
	vendorCompleteOrder,
	createFoodItem,
	deleteFoodItem,
	editFoodItem,
	getFoodItems,
	getVendorPreorderItems,
} from '../controllers/vendorController.js';

const vendorRouter = Router();

vendorRouter.route('/foodItem').post(createFoodItem).get(getFoodItems);

vendorRouter.route('/foodItem/:menuId').patch(editFoodItem);

vendorRouter.route('/foodItem/:menuId').delete(deleteFoodItem);

vendorRouter.route('/preorder').get(getVendorPreorderItems);

vendorRouter.route('/preorder/confirm').patch(vendorCompleteOrder);

export default vendorRouter;
