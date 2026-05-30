import { Router } from "express";
import { NoBodyError } from "../../errors/noBodyError.js";
import { addScheduleController } from "./addSchedule.controller.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        if(!req.body) throw new NoBodyError();
        if(!req.body.sectionId) throw new Error();
        if(!req.body.teacherId) throw new Error();
        if(!req.body.courseId) throw new Error();

        const result = await addScheduleController(req.body);

        res.status(201).json({
            message: `succesfully created schedule with id: ${result.id}`,
            data: result
        })
    } catch (err){
        if (err instanceof NoBodyError) res.status(400).json({ message: 'Missing required parameters: body' });
        if (err instanceof SyntaxError) res.status(400).json({ message: 'Invalid JSON format'});

        res.status(500).json({ message: 'Internal Server Error.'});
    }
})

export { router };