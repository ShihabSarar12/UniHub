import expressAsyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import { verifyToken } from '../utilities/verifyToken.js';
import { pool } from '../config/db.js';

dotenv.config();

const protect = expressAsyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			req.user = await verifyToken(token);
			if (!req.user) {
				res.status(403).json({
					message: 'Invalid token',
				});
				return;
			}
			const [[blacklisted_token]] = await pool.query(
				`SELECT * FROM blacklisted_token WHERE accessToken = ?`,
				[token]
			);
			if (blacklisted_token) {
				res.status(403).json({
					message: 'Blacklisted token',
				});
				return;
			}
			next();
		} catch (error) {
			res.status(401).json({
				message: 'Failed to authorize token',
			});
			return;
		}
	}
	if (!token) {
		res.status(401).json({
			message: 'Token is missing',
		});
		return;
	}
});

export { protect };
