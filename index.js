import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//! remove after testing
app.get('/', async (req, res) => {
	res.status(200).json({
		message: 'Connected!!',
	});
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.SERVER_PORT || 8080;
app.listen(port, () => {
	console.log('Server is running on ' + port);
	console.log(`Listening on http://localhost:${port}/`);
});
