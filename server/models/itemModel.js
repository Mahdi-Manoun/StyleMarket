import mongoose from 'mongoose';

// create a item schema
const itemSchema = new mongoose.Schema({
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    additional_info: { type: Map, of: String },
    image_url: { type: String, default: null }
});

// create a item model for schema
const Item = new mongoose.model('Item', itemSchema);

export default Item;