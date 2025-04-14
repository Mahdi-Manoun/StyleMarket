import express from 'express';
import {
    addCoffee,
    editCoffeeInfo,
    getCoffees,
    removeCoffee
} from '../controllers/coffeeController.js';
import { uploadCoffee } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', uploadCoffee.single('image_url'), addCoffee);

router.get('/', getCoffees);

router.patch('/:_id', uploadCoffee.single('image_url'), editCoffeeInfo);

router.delete('/:_id', removeCoffee)

export default router;