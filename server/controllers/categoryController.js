import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';

const createCategory = async (req, res) => {
    let { title } = req.body;

    title = title?.trim();
    try {
        if (!title) {
            return res.status(400).json({ error: `title field is required.` })
        }

        const category = await Category.create({ title });

        return res.status(201).json({ message: 'Category added successfully!', category })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const editCategory = async (req, res) => {
    const { _id } = req.params;
    let { title } = req.body;

    if (title) title = title.trim();
    try {
        const newCategory = await Category.findByIdAndUpdate(
            _id,
            { $set: { title } },
            { new: true }
        );

        if (!newCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        return res.status(200).json({ message: 'Category updated successfully!', newCategory })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
}


const deleteCategory = async (req, res) => {
    const { _id } = req.params;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid category ID.' });
        }

        const category = await Category.findById(_id);

        if (!category) {
            return res.status(404).json({
                error: 'Category not found.',
                message: `Category with ID ${_id} was not found.`
            });
        }

        await Category.findByIdAndDelete(_id);

        return res.status(200).json({ message: `"${category._id}" deleted successfully!` });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


export {
    createCategory,
    editCategory,
    deleteCategory
};