import { Router } from "express";
import { NoIdError } from "../errors/noIdError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { createTeacher } from "../controllers/createTeacher.js";

export const router = Router();

router.post('/teacher/', async (req, res) => {
    try {
        if(!req.body || Object.keys(req.body).length === 0) throw new NoBodyError();

        const teacher = await createTeacher(JSON.stringify(req.body));

        res.status(200).json({
            message: 'Teacher Created Successfully',
            data: teacher
        })
    } catch (err) {
        if(err instanceof NoBodyError) res.status(400).json({ message: 'missing required parameters: body'});
        if(err instanceof SyntaxError) res.status(400).json({ message: 'Invalid JSON in request body' });

        res.status(500).json({ message: 'internal server error.' });
    }
})