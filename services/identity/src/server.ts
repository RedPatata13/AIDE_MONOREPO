import express from 'express'
import cors from 'cors'
import { router as adminRouter } from './features/registerNewAdmin/registerAdmin.route.js';
import { router as teacherRouter } from './features/registerNewTeacher/registerTeacher.route.js';
import { router as studentRouter } from './features/registerNewStudent/registerStudent.route.js';

const PATH_PREFIX = "/identity";

const app = express();
app.use(cors());

app.use(PATH_PREFIX, adminRouter);
app.use(PATH_PREFIX, teacherRouter);
app.use(PATH_PREFIX, studentRouter);

app.listen(3000);