import mongoose from 'mongoose';

// create a coffee schema
const coffeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    weTaste: { type: [String], required: true },
    process: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    image_url: { type: String, default: null }
});

// create a coffee model for schema
const Coffee = new mongoose.model('Coffee', coffeeSchema);

export default Coffee;