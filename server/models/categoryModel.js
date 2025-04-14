import mongoose from 'mongoose';

// create a category schema
const categorySchema = new mongoose.Schema({
    title: { type: String, required: true }
});

// create a category model for schema
const Category = new mongoose.model('Category', categorySchema);

export default Category;