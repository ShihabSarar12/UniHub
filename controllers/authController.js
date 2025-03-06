import expressAsyncHandler from 'express-async-handler';
import pool from '../config/db.js';
import {
	generateAccessToken,
	generateRefreshToken,
} from '../utilities/generateToken.js';

const authGetSpecializedUser = async (user_id) => {
	const [[facilitator]] = await pool.query(
		`SELECT facilitator_id FROM facilitators WHERE user_id = ?`,
		[user_id]
	);
	if (facilitator?.facilitator_id) return facilitator.facilitator_id;
	const [[trainer]] = await pool.query(
		`SELECT trainer_id FROM trainers WHERE user_id = ?`,
		[user_id]
	);
	if (trainer?.trainer_id) return trainer.trainer_id;
	const [[athlete]] = await pool.query(
		`SELECT athlete_id FROM athletes WHERE user_id = ?`,
		[user_id]
	);
	if (athlete?.athlete_id) return athlete.athlete_id;
	const [[parent]] = await pool.query(
		`SELECT parent_id FROM parents WHERE user_id = ?`,
		[user_id]
	);
	if (parent?.parent_id) return parent.parent_id;
	return null;
};

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
	//TODO have to make changes to the Specialized User
	const specializedUserId = await authGetSpecializedUser(
		filteredUser.user_id
	);
	res.status(verified && specializedUserId ? 200 : 403).json({
		loginStatus: verified && specializedUserId ? true : false,
		specializedUserId:
			verified && specializedUserId ? specializedUserId : null,
		user: verified && specializedUserId ? filteredUser : null,
		accessToken:
			verified && specializedUserId
				? generateAccessToken(filteredUser.user_id)
				: null,
		refreshToken:
			verified && specializedUserId
				? await generateRefreshToken(filteredUser.user_id)
				: null,
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
		[available.user_id, token]
	);
	if (deletionStatus.affectedRows === 0)
		throw new Error('Failed to delete refresh token');
	const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
	const accessToken = generateAccessToken(decoded.id);
	const refreshToken = await generateRefreshToken(decoded.id);
	const [{ affectedRows }] = await pool.query(
		`INSERT INTO token_management (userId, token) VALUES (?, ?)`,
		[available.user_id, refreshToken]
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
	const emailRegex =
		/^[a-zA-Z0-9._%+-]+?\.(student|cafeteria|bus|faculty|club)(\.\d+)?@aust\.edu$/;
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

export { authValidates, authLogin, authCheckRefreshToken, authRegister };
