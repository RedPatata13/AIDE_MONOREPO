import { Router } from "express";
import { registerAdminController } from "./registerAdmin.controller.js";
import { NoBodyError } from "../../errors/noBodyError.js";

const router = Router();

router.post('/admin', async (req, res) => {
    try {
        if(!req.body) throw new NoBodyError();
        const result = await registerAdminController(req.body);
        res.status(201).json({ message: `Admin with id: ${result.admin.id} created`})
    } catch (err) {
        if (err instanceof NoBodyError) res.status(400).json({ message: 'Missing required parameters: body'});
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

export { router }