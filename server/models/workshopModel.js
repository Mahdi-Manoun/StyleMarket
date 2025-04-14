import mongoose from 'mongoose';

// create a workshop schema
const workshopSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    length_value: { type: Number, required: true },
    length_unit: {
        type: String,
        enum: ['m', 'h'],
        required: true
    },
    class_size: { type: Number, default: null },
    description: { type: String, required: true },
    image_url: { type: String, default: null }
});

// create a workshop model for schema
const Workshop = new mongoose.model('Workshop', workshopSchema);

export default Workshop;