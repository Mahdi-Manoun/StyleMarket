import express from 'express';
import {
    addWorkshop,
    editWorkshopInfo,
    getWorkshops,
    removeWorkshop
} from '../controllers/workshopController.js';
import { uploadWorkshop } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', uploadWorkshop.single('image_url'), addWorkshop);

router.get('/', getWorkshops);

router.patch('/:_id', uploadWorkshop.single('image_url'), editWorkshopInfo);

router.delete('/:_id', removeWorkshop);

export default router;