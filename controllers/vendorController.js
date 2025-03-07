import expressAsyncHandler from 'express-async-handler';
import pool from '../config/db.js';

const createFoodItem = expressAsyncHandler(async (req, res) => {
	const { name, price, nutrition, image, vendorId } = req.body;
	if (!vendorId || isNaN(vendorId)) {
		res.status(400).json({ message: 'Invalid vendor id' });
		return;
	}
	if (!name || typeof name === 'string' || name.trim().length === 0) {
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
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO cafeteria_menus (name, price, nutrition, image, vendorId) VALUES (?, ?, ?, ?, ?)`,
		[name, price, nutrition, image, vendorId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to create food item' });
		return;
	}
	res.status(201).json({ message: 'Food item created' });
});

const getFoodItems = expressAsyncHandler(async (req, res) => {
	const [foodItems] = await pool.query(`SELECT * FROM cafeteria_menus`);
	res.status(200).json({ foodItems });
});

const editFoodItem = expressAsyncHandler(async (req, res) => {
	const { menuId } = req.params;
	const { name, price, nutrition, image } = req.body;
	if (!name || typeof name === 'string' || name.trim().length === 0) {
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
	const [{ affectedRows }] = await pool.query(
		`UPDATE cafeteria_menus SET name = ?, price = ?, nutrition = ?, image = ? WHERE id = ?`,
		[name, price, nutrition, image]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to create food item' });
		return;
	}
	res.status(201).json({ message: 'Food item created' });
});

const deleteFoodItem = expressAsyncHandler(async (req, res) => {
	const { menuId } = req.params;
	if (!menuId || isNaN(menuId)) {
		res.status(400).json({ message: 'Invalid id' });
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`DELETE FROM cafeteria_menus WHERE id = ?`,
		[menuId]
	);
	if (affectedRows === 0) {
		res.status(400).json({ message: 'Failed to delete food item' });
		return;
	}
	res.status(201).json({ message: 'Food item deleted' });
});

export { createFoodItem, getFoodItems, editFoodItem, deleteFoodItem };
