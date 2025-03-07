import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import authRouter from './routes/authRoute.js';
import vendorRouter from './routes/vendorRoute.js';
import busRouter from './routes/busRoute.js';
import classRouter from './routes/classRoute.js';
import socketInitialize from './realtime/socket.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(vendorRouter);
app.use(busRouter);
app.use(classRouter);

//! remove after testing
app.get('/', async (req, res) => {
	res.status(200).json({
		message: 'Connected!!',
	});
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.SERVER_PORT || 8080;
const server = app.listen(port, () => {
	console.log('Server is running on ' + port);
	console.log(`Listening on http://localhost:${port}/`);
});
const io = new Server(server, {
	pingTimeout: 60000,
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', socketInitialize);

export { io };
