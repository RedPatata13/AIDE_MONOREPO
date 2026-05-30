import { Router } from "express";
import { NoIdError } from "../errors/noIdError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { createStudent } from "../controllers/createStudent.js";

export const router = Router();

router.post('/student/', async (req, res) => {
    try {
        if(!req.body || Object.keys(req.body).length === 0) throw new NoBodyError();

        const student = await createStudent(JSON.stringify(req.body));

        res.status(200).json({
            message: 'Student Created Successfully',
            data: student
        })
    } catch (err) {
        if(err instanceof NoBodyError) res.status(400).json({ message: 'missing required parameters: body'});
        if(err instanceof SyntaxError) res.status(400).json({ message: 'Invalid JSON in request body' });

        res.status(500).json({ message: 'internal server error.' });
    }
})