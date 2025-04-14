import express from 'express';
import {
    addProduct,
    deleteProduct,
    editProduct,
    getAllProducts,
    getProduct
} from '../controllers/productController.js';

// middleware
import { uploadProduct } from '../middlewares/upload.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/', isAdmin, uploadProduct.single('images'), addProduct);

router.get('/', getAllProducts);

router.get('/filter', getProduct);

router.patch('/:id', isAdmin, uploadProduct.single('images'), editProduct);

router.delete('/:id', isAdmin, deleteProduct);

export default router;