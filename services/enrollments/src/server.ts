import express from 'express';
import cors from 'cors';
import { router as studentRouter } from './routes/createStudent.route.js';
import { router as teacherRouter } from './routes/createTeacher.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy'
	});
});

app.use('/event', studentRouter);
app.use('/event', teacherRouter);

app.listen(3000, () => {
	console.log('Server running on port 3000');
});