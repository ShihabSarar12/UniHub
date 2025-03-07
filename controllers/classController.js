import expressAsyncHandler from 'express-async-handler';
import { pool } from '../config/db.js';

const getRoutine = expressAsyncHandler(async (req, res) => {
	const [schedules] = await pool.query(
		`SELECT 
            cs.courseName,
            cs.room,
            cs.startTime,
            cs.endTime,
            u.name AS scheduleMaker,
            u2.name AS facultyName
        FROM 
            class_schedules cs
        LEFT JOIN
            users u ON cs.scheduleMakerId = u.userId
        LEFT JOIN
            users u2 ON cs.facultyId = u2.userId`
	);
	res.status(200).json({ schedules });
});

export { getRoutine };
