import {
	broadcastLocation,
	connectUser,
	disconnectUser,
	sendNotification,
} from './socketController.js';

const socketInitialize = (socket) => {
	console.log('Connected to socket.io', socket.id);

	socket.on('connect_user', async (data) => {
		await connectUser(data, socket);
	});
	socket.on('disconnect_user', async (data) => {
		await disconnectUser(data, socket);
	});

	socket.on('location', async (data) => {
		await broadcastLocation(data, socket);
	});
	socket.on('notification', async (data) => {
		await sendNotification(data, socket);
	});
};

export default socketInitialize;
