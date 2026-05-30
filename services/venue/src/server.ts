import express from 'express'
import cors from 'cors';
import { router as roomRouter } from './features/addRoom/addRoom.route.js';
import { router as schedRouter } from './features/addSchedule/addSchedule.route.js';

const service_prefix = 'venue/';

const app = express();

app.use(cors());
app.use(service_prefix + '/room', roomRouter);
app.use(service_prefix + '/schedule', schedRouter);

app.listen(3000);