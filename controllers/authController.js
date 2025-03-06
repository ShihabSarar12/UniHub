import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import {
	generateAccessToken,
	generateRefreshToken,
} from '../utilities/generateToken.js';

const authValidates = expressAsyncHandler(async (req, res, next) => {
	const { email } = req.body;
	const [[user]] = await pool.query(
		`SELECT userId, type, name, img, email, password FROM users WHERE email = ?`,
		[email]
	);
	if (!user) {
		res.status(403).json({
			message: 'User does not exist',
		});
		return;
	}
	req.user = user;
	next();
});

const authLogin = expressAsyncHandler(async (req, res) => {
	const { verified, user } = req;
	const { password, ...filteredUser } = user;
	res.status(verified ? 200 : 403).json({
		loginStatus: verified ? true : false,
		user: verified ? filteredUser : null,
		accessToken: verified ? generateAccessToken(filteredUser.userId) : null,
		refreshToken: verified
			? await generateRefreshToken(filteredUser.userId)
			: null,
	});
});

const authLogout = expressAsyncHandler(async (req, res) => {
	const { accessToken, refreshToken } = req.body;
	if (!refreshToken || !accessToken) {
		res.status(400).json({
			message: 'Token is missing',
		});
		return;
	}
	const [insertStatus] = await pool.query(
		`INSERT INTO blacklisted_token (refreshToken, accessToken) VALUES (?, ?)`,
		[refreshToken, accessToken]
	);
	if (insertStatus.affectedRows === 0)
		throw new Error('Failed to blacklist token');
	const [{ affectedRows }] = await pool.query(
		`DELETE FROM token_management WHERE token = ?`,
		[refreshToken]
	);
	if (affectedRows === 0) throw new Error('Failed to log out');
	res.status(200).json({
		message: 'Successfully logged out',
	});
});

const authCheckRefreshToken = expressAsyncHandler(async (req, res) => {
	const { token } = req.body;
	if (!token) {
		res.status(200).json({
			message: 'Token is missing',
		});
		return;
	}
	const [[blacklistedToken]] = await pool.query(
		`SELECT * FROM blacklisted_token WHERE refreshToken = ?`,
		[token]
	);
	if (blacklistedToken) {
		res.status(403).json({
			message: 'Blacklisted token',
		});
		return;
	}
	const [[available]] = await pool.query(
		`SELECT * FROM token_management WHERE token = ?`,
		[token]
	);
	if (!available) {
		res.status(403).json({
			message: 'Invalid refresh token',
		});
		return;
	}
	const [deletionStatus] = await pool.query(
		`DELETE FROM token_management WHERE userId = ? AND token = ?`,
		[available.userId, token]
	);
	const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
	const accessToken = generateAccessToken(decoded.id);
	const refreshToken = await generateRefreshToken(decoded.id);
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO token_management (userId, token) VALUES (?, ?)`,
		[available.userId, refreshToken]
	);
	if (affectedRows === 0) throw new Error('Failed to update refresh token');
	res.status(200).json({
		accessToken,
		refreshToken,
	});
});

const authRegister = expressAsyncHandler(async (req, res) => {
	const { name, email } = req.body;
	if (!name) {
		res.status(400).json({
			message: 'Full name is missing',
		});
		return;
	}
	if (!email) {
		res.status(400).json({
			message: 'Email is missing',
		});
		return;
	}
	const [[user]] = await pool.query(
		`SELECT email FROM users WHERE email = ?`,
		[email]
	);
	if (user) {
		res.status(403).json({
			message: 'This email is already in use',
		});
		return;
	}
	let message = '';
	const emailRegex = /^[a-zA-Z0-9._%+-]+@aust\.edu$/;
	if (typeof name !== 'string' || typeof email !== 'string') {
		res.status(400).json({
			message: 'Bad input',
		});
		return;
	}
	if (!emailRegex.test(email)) {
		message += 'Email is not appropriate\n';
	}
	if (typeof message === 'string' && message) {
		res.status(400).json({
			message,
		});
		return;
	}
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
		[name, email, req.hash]
	);
	if (affectedRows === 0) throw new Error('Could not create user');
	res.status(201).json({
		message: 'User created successfully',
	});
});

export {
	authValidates,
	authLogin,
	authCheckRefreshToken,
	authRegister,
	authLogout,
};
