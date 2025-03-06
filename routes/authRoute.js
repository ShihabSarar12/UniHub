import { Router } from 'express';
import {
	authCheckRefreshToken,
	authLogin,
	authRegister,
	authValidates,
} from '../controllers/authController.js';
import {
	passwordCompare,
	passwordHash,
} from '../middlewares/passwordHashMiddleware.js';

const authRouter = Router();

authRouter.route('/register').post(passwordHash, authRegister);

authRouter.route('/login').post(authValidates, passwordCompare, authLogin);

authRouter.route('/refreshToken').post(authCheckRefreshToken);
