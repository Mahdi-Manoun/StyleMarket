import Workshop from '../models/workshopModel.js';
import mongoose from 'mongoose';

const addWorkshop = async (req, res) => {
    let { title, length_value, length_unit, class_size, description } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/workshop/${req.file.filename}` : null;

    title = title?.trim();
    length_unit = length_unit?.trim();
    description = description?.trim();

    try {
        const errorList = [];

        if (!title || !length_unit || !length_unit || !class_size || !description || !imageUrl) {
            errorList.push('All fields are required.')
        }

        if (!Number.isInteger(Number(length_value)) || length_value <= 0) {
            errorList.push('Length value must be integer > 0 .');
        }

        if (!['hours', 'hour', 'h', 'minutes', 'minute', 'm'].includes(length_unit)) {
            errorList.push('Time unit must be hours (h) or minutes (m).');
        }

        if (!Number.isInteger(Number(class_size)) || class_size <= 0) {
            errorList.push('Class size must be integer > 0 .');
        }

        if (errorList.length > 0) {
            return res.status(400).json({ errors: errorList });
        }

        length_unit = length_unit.charAt(0).toLowerCase();

        const newWorkshop = new Workshop({
            title,
            length_value,
            length_unit,
            class_size,
            description,
            image_url: imageUrl
        });

        await newWorkshop.save();
        return res.status(201).json({ message: 'Workshop added successfully!', workshop: newWorkshop });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const getWorkshops = async (req, res) => {
    try {
        const workshops = await Workshop.find();

        return res.status(200).json(workshops);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const editWorkshopInfo = async (req, res) => {
    const { _id } = req.params;
    const { title, length_value, length_unit, class_size, description } = req.body;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ 
                error: 'Invalid ID format.',
                message: 'The provided workshop ID is not valid.'
            });
        }

        const workshop = await Workshop.findById(_id);
        if (!workshop) {
            return res.status(404).json({ 
                error: 'Not found.',
                message: `Workshop with ID ${_id} doesn't exist.`
            });
        }

        if (req.file) {
            workshop.image_url = `/uploads/workshop/${req.file.filename}`;
            console.log('New image path set:', workshop.image_url);
        }

        const validationErrors = [];

        if (length_value && (!Number.isInteger(Number(length_value)) || length_value <= 0)) {
            validationErrors.push('Duration must be a positive integer.');
        }

        if (length_unit && !['hours', 'hour', 'h', 'minutes', 'minute', 'm'].includes(length_unit)) {
            validationErrors.push('Time unit must be hours (h) or minutes (m).');
        }

        if (class_size && (!Number.isInteger(Number(class_size)) || class_size <= 0)) {
            validationErrors.push('Class size must be a positive integer.');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed.',
                details: validationErrors 
            });
        }

        if (title) workshop.title = title.trim();
        if (description) workshop.description = description.trim();
        if (length_value) workshop.length_value = Number(length_value);
        if (class_size) workshop.class_size = Number(class_size);
        
        if (length_unit) {
            workshop.length_unit = length_unit.charAt(0).toLowerCase();
        }

        const updatedWorkshop = await workshop.save();

        console.log('Uploaded file:', req.file);


        return res.status(200).json({
            success: true,
            message: 'Workshop updated successfully!',
            data: updatedWorkshop
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const removeWorkshop = async (req, res) => {
    const { _id } = req.params;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid workshop ID.' });
        }

        const workshop = await Workshop.findById(_id);

        if (!workshop) {
            return res.status(404).json({
                error: 'Workshop not found.',
                message: `Workshop with ID ${_id} was not found.`
            });
        }

        await Workshop.findByIdAndDelete(_id);

        return res.status(200).json({ message: `"${workshop._id}" deleted successfully!` });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export {
    addWorkshop,
    getWorkshops,
    editWorkshopInfo,
    removeWorkshop
};