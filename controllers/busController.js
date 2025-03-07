import expressAsyncHandler from 'express-async-handler';
import { pool } from '../config/db.js';
const getBusRoutes = expressAsyncHandler(async (req, res) => {
	const [routes] = await pool.query(
		`SELECT
            br.routeId,
            br.routeName,
            br.startLocation,
            br.endLocation,
            u.name as coordinatorName,
            u.phone as coordinatorPhone,
            u.email as coordinatorEmail
        FROM
            bus_routes br
        LEFT JOIN
            users u ON br.coordinatorId = u.userId`
	);
	res.status(200).json({ routes });
});

export { getBusRoutes };
