import { pool } from '../config/db.js';
import dotenv from 'dotenv';
import { io } from '../index.js';

dotenv.config();

const connectUser = async (data, socket) => {
	try {
		const [{ affectedRows }] = await pool.query(
			`UPDATE users SET socketId = ? WHERE userId = ?`,
			[socket.id, data.userId]
		);
		if (affectedRows === 0) {
			socket.emit('validation', {
				message: 'Failed to connect user',
			});
			return;
		}
		socket.emit('validation', {
			message: 'Connected user',
		});
	} catch (error) {
		socket.emit('validation', {
			message: error.message,
		});
	}
};

const disconnectUser = async (data, socket) => {
	try {
		const [{ affectedRows }] = await pool.query(
			`UPDATE users SET socketId = ? WHERE userId = ?`,
			[null, data.userId]
		);
		if (affectedRows === 0) {
			socket.emit('validation', {
				message: 'Failed to connect user',
			});
			return;
		}
		socket.emit('validation', {
			message: 'Disconnected user',
		});
	} catch (error) {
		socket.emit('validation', {
			message: error.message,
		});
	}
};

const broadcastLocation = async (data, socket) => {
	try {
		const [sockets] = await pool.query(
			`SELECT socketId FROM users WHERE userId <> ? AND socketId IS NOT NULL AND type='student'`,
			[data.userId]
		);
		if (sockets.length === 0) {
			socket.emit('validation', {
				message: 'No other users to broadcast location',
			});
			return;
		}
		sockets.forEach((socket) => {
			io.to(socket.socketId).emit('location', {
				user_id: data.userId,
				location: data.location,
			});
		});
	} catch (error) {
		socket.emit('validation', {
			message: error.message,
		});
	}
};

const sendNotification = async (data, socket) => {
	try {
		const [sockets] = await pool.query(
			`SELECT socketId FROM users WHERE userId <> ? AND socketId IS NOT NULL AND type='student'`,
			[data.userId]
		);
		if (sockets.length === 0) {
			socket.emit('validation', {
				message: 'No other users to broadcast location',
			});
			return;
		}
		sockets.forEach((socket) => {
			io.to(socket.socketId).emit('notification', {
				title: data.title,
				message: data.message,
				time: data.time,
			});
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

export { connectUser, disconnectUser, broadcastLocation, sendNotification };
