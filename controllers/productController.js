import sequelize from '../config/db.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// models
import Product from '../models/product.model.js';
import ProductImage from '../models/productImage.model.js';
import ProductInventory from '../models/productInventory.model.js';
import Category from '../models/category.model.js';
import Color from '../models/color.model.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// add a product
const addProduct = async (req, res) => {
    const { name, price, description, category_id, inventory, images: additionalImages = [] } = req.body;
    const uploadedImage = req.file ? {
        url: `http://localhost:5000/uploads/product/${req.file.filename}`,
        is_primary: true
    } : null;

    try {
        const errors = [];
        if (!name || !name.trim()) errors.push('Name is required');
        if (!category_id || isNaN(category_id) || category_id <= 0) errors.push('Valid category ID is required');

        if (errors.length > 0) {
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/product', req.file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            return res.status(400).json({ success: false, errors });
        }

        const transaction = await sequelize.transaction();

        try {
            const product = await Product.create({
                name: name.trim(),
                price: price || 0,
                description: description?.trim() || null,
                category_id
            }, { transaction });

            const imagesToCreate = [];

            if (uploadedImage) {
                imagesToCreate.push({
                    product_id: product.id,
                    image_url: uploadedImage.url,
                    is_primary: true
                });

                if (Array.isArray(additionalImages)) {
                    additionalImages.forEach(image => {
                        if (image.url) {
                            imagesToCreate.push({
                                product_id: product.id,
                                image_url: image.url,
                                is_primary: false
                            });
                        }
                    });
                }
            }
            else if (Array.isArray(additionalImages)) {
                let hasPrimary = false;

                additionalImages.forEach(image => {
                    if (image.url) {
                        const isPrimary = !hasPrimary && (image.is_primary || false);
                        imagesToCreate.push({
                            product_id: product.id,
                            image_url: image.url,
                            is_primary: isPrimary
                        });
                        if (isPrimary) hasPrimary = true;
                    }
                });

                if (!hasPrimary && imagesToCreate.length > 0) {
                    imagesToCreate[0].is_primary = true;
                }
            }

            if (imagesToCreate.length > 0) {
                await ProductImage.bulkCreate(imagesToCreate, { transaction });
            }

            if (inventory && Array.isArray(inventory)) {
                const inventoryToCreate = inventory
                    .filter(item => item.color_id && !isNaN(item.color_id))
                    .map(item => ({
                        product_id: product.id,
                        color_id: item.color_id,
                        quantity: !isNaN(item.quantity) ? Number(item.quantity) : 0
                    }));

                if (inventoryToCreate.length > 0) {
                    await ProductInventory.bulkCreate(inventoryToCreate, { transaction });
                }
            }

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: 'Product added successfully!',
                product,
                images: imagesToCreate,
                inventory: inventory || []
            });

        } catch (error) {
            await transaction.rollback();
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/product', req.file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            console.error('Error adding product:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error); // debugging line
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};


// get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: ProductImage,
                    attributes: ['id', 'image_url', 'is_primary'],
                    order: [['is_primary', 'DESC']]
                },
                {
                    model: ProductInventory,
                    include: [{
                        model: Color,
                        attributes: ['id', 'name']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (!products.length) {
            return res.status(404).json({
                success: false,
                message: 'No products found'
            });
        }

        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: {
                id: product.Category?.id,
                name: product.Category?.name
            },
            images: product.ProductImages,
            inventory: product.ProductInventories?.map(inv => ({
                id: inv.id,
                color_id: inv.color_id,
                color_name: inv.Color?.name,
                quantity: inv.quantity,
                created_at: inv.created_at
            })),
            created_at: product.created_at
        }));

        return res.status(200).json({
            success: true,
            count: products.length,
            data: formattedProducts
        });

    } catch (error) {
        console.error('Unexpected error:', error); // debugging line
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};


// get a single product or products by supplier_id or category (filtering)
const getProduct = async (req, res) => {
    const { id, name, category_id } = req.query;

    try {
        let whereClause = {};

        if (id && !isNaN(id)) whereClause.id = parseInt(id);
        if (name) whereClause.name = { [Op.like]: `%${name}%` };
        if (category_id && !isNaN(category_id)) whereClause.category_id = parseInt(category_id);

        const products = await Product.findAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: ProductImage,
                    attributes: ['id', 'image_url', 'is_primary'],
                    order: [['is_primary', 'DESC']]
                },
                {
                    model: ProductInventory,
                    attributes: ['id', 'quantity', 'created_at', 'updated_at'],
                    include: [{
                        model: Color,
                        attributes: ['id', 'name']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'No products found matching your criteria'
            });
        }

        const formattedProducts = products.map(product => {
            const sortedImages = product.ProductImages
                ? [...product.ProductImages].sort((a, b) => b.is_primary - a.is_primary)
                : [];

            const formattedInventory = product.ProductInventories
                ? product.ProductInventories.map(inv => ({
                    id: inv.id,
                    quantity: inv.quantity,
                    color: {
                        id: inv.Color?.id,
                        name: inv.Color?.name
                    },
                    created_at: inv.created_at,
                    updated_at: inv.updated_at
                }))
                : [];

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                category: product.Category
                    ? { id: product.Category.id, name: product.Category.name }
                    : null,
                images: sortedImages.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    is_primary: img.is_primary
                })),
                inventory: formattedInventory,
                created_at: product.created_at,
                updated_at: product.updated_at
            };
        });

        return res.status(200).json({
            success: true,
            count: formattedProducts.length,
            data: formattedProducts
        });

    } catch (error) {
        console.error('Unexpected error:', error); // debugging line
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};


// edit product's info
const editProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category_id, inventory, images } = req.body;
    const uploadedImage = req.file ? {
        url: `http://localhost:5000/uploads/product/${req.file.filename}`,
        is_primary: true
    } : null;

    try {
        const transaction = await sequelize.transaction();

        try {
            const product = await Product.findByPk(id, { transaction });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Product with ID ${id} not found`
                });
            }

            await product.update({
                name: name ? name.trim() : product.name,
                price: price ?? product.price,
                description: description ? description.trim() : product.description,
                category_id: category_id ?? product.category_id
            }, { transaction });

            if (uploadedImage || (images && Array.isArray(images))) {
                await ProductImage.destroy({
                    where: { product_id: id },
                    transaction
                });

                const imagesToCreate = [];

                if (uploadedImage) {
                    imagesToCreate.push({
                        product_id: id,
                        image_url: uploadedImage.url,
                        is_primary: true
                    });
                }

                if (images && Array.isArray(images)) {
                    let hasPrimary = Boolean(uploadedImage);

                    images.forEach(image => {
                        if (image.url) {
                            const isPrimary = !hasPrimary && (image.is_primary || false);
                            imagesToCreate.push({
                                product_id: id,
                                image_url: image.url,
                                is_primary: isPrimary
                            });
                            if (isPrimary) hasPrimary = true;
                        }
                    });

                    if (!hasPrimary && imagesToCreate.length > 0) {
                        imagesToCreate[0].is_primary = true;
                    }
                }

                if (imagesToCreate.length > 0) {
                    await ProductImage.bulkCreate(imagesToCreate, { transaction });
                }
            }

            if (inventory && Array.isArray(inventory)) {
                await ProductInventory.destroy({
                    where: { product_id: id },
                    transaction
                });

                const inventoryToCreate = inventory
                    .filter(item => item.color_id && !isNaN(item.color_id))
                    .map(item => ({
                        product_id: id,
                        color_id: item.color_id,
                        quantity: !isNaN(item.quantity) ? Number(item.quantity) : 0
                    }));

                if (inventoryToCreate.length > 0) {
                    await ProductInventory.bulkCreate(inventoryToCreate, { transaction });
                }
            }

            await transaction.commit();

            const updatedProduct = await Product.findByPk(id, {
                include: [
                    { model: ProductImage },
                    {
                        model: ProductInventory,
                        include: [Color]
                    }
                ]
            });

            return res.status(200).json({
                success: true,
                message: 'Product updated successfully!',
                product: updatedProduct
            });

        } catch (error) {
            await transaction.rollback();
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/product', req.file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            console.error('Error updating product:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error); // debugging line
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};


// delete a product
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await sequelize.transaction();

        try {
            const product = await Product.findByPk(id, {
                include: [{
                    model: ProductImage,
                    attributes: ['id', 'image_url']
                }],
                transaction
            });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Product with ID ${id} not found`
                });
            }

            await ProductImage.destroy({
                where: { product_id: id },
                transaction
            });

            await ProductInventory.destroy({
                where: { product_id: id },
                transaction
            });

            // delete images from folder
            if (product.ProductImages && product.ProductImages.length > 0) {
                product.ProductImages.forEach(async (image) => {
                    if (image.image_url.includes('/uploads/product/')) {
                        const filename = image.image_url.split('/').pop();
                        const filePath = path.join(__dirname, '../public/uploads/product', filename);

                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                });
            }

            await product.destroy({ transaction });

            await transaction.commit();

            return res.status(200).json({
                success: true,
                message: `Product with ID ${id} and all related data deleted successfully!`
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error deleting product:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error); // debugging line
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

export {
    addProduct,
    getAllProducts,
    getProduct,
    editProduct,
    deleteProduct
};