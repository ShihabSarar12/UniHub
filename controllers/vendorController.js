import expressAsyncHandler from 'express-async-handler';
import { pool } from '../config/db.js';

const createFoodItem = expressAsyncHandler(async (req, res) => {
	const { name, price, nutrition, image, vendorId } = req.body;
	if (!vendorId || isNaN(vendorId)) {
		res.status(400).json({ message: 'Invalid vendor id' });
		return;
	}
	if (!name || typeof name !== 'string') {
		res.status(400).json({ message: 'Invalid name or missing' });
		return;
	}
	if (price < 0 || !price || typeof price !== 'number') {
		res.status(400).json({ message: 'Invalid price or missing' });
		return;
	}
	if (nutrition < 0 || !nutrition || typeof nutrition !== 'number') {
		res.status(400).json({ message: 'Invalid nutrition or missing' });
		return;
	}
	if (!image || typeof image !== 'string' || image.trim().length === 0) {
		res.status(400).json({ message: 'Invalid image or missing' });
		return;
	}
	const [[availableVendor]] = await pool.query(
		`SELECT * FROM users WHERE userId = ?`,
		[vendorId]
	);
	if (!availableVendor) {
		res.status(400).json({ message: 'Vendor not found' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO cafeteria_menu (name, price, nutrition, image, vendorId) VALUES (?, ?, ?, ?, ?)`,
		[name, price, nutrition, image, vendorId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to create food item' });
		return;
	}
	res.status(201).json({ message: 'Food item created' });
});

const getFoodItems = expressAsyncHandler(async (req, res) => {
	const [foodItems] = await pool.query(
		`SELECT
			cm.menuId,
			cm.name,
			cm.price,
			cm.nutrition,
			cm.image,
			u.name as vendorName
		FROM 
			cafeteria_menu cm
		LEFT JOIN
			users u ON cm.vendorId = u.userId`
	);
	res.status(200).json({ foodItems });
});

const editFoodItem = expressAsyncHandler(async (req, res) => {
	const { menuId } = req.params;
	if (!menuId || isNaN(menuId)) {
		res.status(400).json({ message: 'Invalid id' });
		return;
	}
	const { name, price, nutrition, image } = req.body;
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		res.status(400).json({ message: 'Invalid name or missing' });
		return;
	}
	if (price < 0 || !price || typeof price !== 'number') {
		res.status(400).json({ message: 'Invalid price or missing' });
		return;
	}
	if (nutrition < 0 || !nutrition || typeof nutrition !== 'number') {
		res.status(400).json({ message: 'Invalid nutrition or missing' });
		return;
	}
	if (!image || typeof image !== 'string' || image.trim().length === 0) {
		res.status(400).json({ message: 'Invalid image or missing' });
		return;
	}
	const [[available]] = await pool.query(
		`SELECT * FROM cafeteria_menu WHERE menuId = ?`,
		[menuId]
	);
	if (!available) {
		res.status(400).json({ message: 'Food item not found' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`UPDATE 
            cafeteria_menu
        SET
            name = ?,
            price = ?,
            nutrition = ?,
            image = ?
        WHERE
            menuId = ?`,
		[name, price, nutrition, image, menuId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to update food item' });
		return;
	}
	res.status(201).json({ message: 'Food item updated' });
});

const deleteFoodItem = expressAsyncHandler(async (req, res) => {
	const { menuId } = req.params;
	if (!menuId || isNaN(menuId)) {
		res.status(400).json({ message: 'Invalid id' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`DELETE FROM cafeteria_menu WHERE menuId = ?`,
		[menuId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to delete food item' });
		return;
	}
	res.status(201).json({ message: 'Food item deleted' });
});

const getVendorPreorderItems = expressAsyncHandler(async (req, res) => {
	const [preorderItems] = await pool.query(
		`SELECT
			po.orderId,
			u.name as userName,
			cm.name as menuName,
			po.quantity,
			po.status,
			po.orderTime
		FROM 
			pre_orders po
		LEFT JOIN
			cafeteria_menu cm ON po.menuId = cm.menuId
		LEFT JOIN
			users u ON po.userId = u.userId
		`
	);
	res.status(200).json({ preorderItems });
});

const vendorCompleteOrder = expressAsyncHandler(async (req, res) => {
	const { orderId } = req.body;
	if (!orderId || isNaN(orderId)) {
		res.status(400).json({ message: 'Invalid order id' });
		return;
	}
	const [[available]] = await pool.query(
		`SELECT * FROM pre_orders WHERE orderId = ?`,
		[orderId]
	);
	if (!available) {
		res.status(400).json({ message: 'Order not found' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`UPDATE 
            pre_orders
        SET
            status = 'completed'
        WHERE
            orderId = ?`,
		[orderId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to confirm order' });
		return;
	}
	res.status(201).json({ message: 'Order confirmed' });
});

const placePreorder = expressAsyncHandler(async (req, res) => {
	const { userId, menuId, quantity } = req.body;
	if (!userId || isNaN(userId)) {
		res.status(400).json({ message: 'Invalid user id' });
		return;
	}
	if (!menuId || isNaN(menuId)) {
		res.status(400).json({ message: 'Invalid menu id' });
		return;
	}
	if (!quantity || isNaN(quantity)) {
		res.status(400).json({ message: 'Invalid quantity' });
		return;
	}
	const [[available]] = await pool.query(
		`SELECT * FROM cafeteria_menu WHERE menuId = ?`,
		[menuId]
	);
	if (!available) {
		res.status(400).json({ message: 'Menu not found' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO pre_orders (userId, menuId, quantity) VALUES (?, ?, ?)`,
		[userId, menuId, quantity]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to place order' });
		return;
	}
	res.status(201).json({ message: 'Order placed' });
});

export {
	createFoodItem,
	getFoodItems,
	editFoodItem,
	deleteFoodItem,
	getVendorPreorderItems,
	vendorCompleteOrder,
	placePreorder,
};
