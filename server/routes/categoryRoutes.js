import express from 'express';
import {
    createCategory,
    deleteCategory,
    editCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createCategory);

router.patch('/:_id', editCategory);

router.delete('/:_id', deleteCategory);

export default router