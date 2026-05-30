import { Router } from "express";
import { NoBodyError } from "../../errors/noBodyError.js";
import { registerStudentController } from "./registerStudent.controller.js";

const router = Router();

router.post('/student', async (req, res) => {
    try {
        if(!req.body) throw new NoBodyError();
        const result = await registerStudentController(req.body);
        res.status(201).json({ message: `Student with id: ${result.student.id} created`})
    } catch (err) {
        if (err instanceof NoBodyError) res.status(400).json({ message: 'Missing required parameters: body'});
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

export { router }