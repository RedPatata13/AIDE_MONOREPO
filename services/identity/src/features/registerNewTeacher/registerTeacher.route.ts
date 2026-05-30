import { Router } from "express";
import { NoBodyError } from "../../errors/noBodyError.js";
import { registerTeacherController } from "./registerTeacher.controller.js";

const router = Router();

router.post('/teacher', async (req, res) => {
    try {
        if(!req.body) throw new NoBodyError();
        const result = await registerTeacherController(req.body);
        res.status(201).json({ message: `Teacher with id: ${result.teacher.id} created`})
    } catch (err) {
        if (err instanceof NoBodyError) res.status(400).json({ message: 'Missing required parameters: body'});
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

export { router }