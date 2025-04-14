import Coffee from '../models/coffeeModel.js';
import mongoose from 'mongoose';

const addCoffee = async (req, res) => {
    let { name, country, weTaste, process, score } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/coffee/${req.file.filename}` : null;

    name = name?.trim();
    country = country?.trim();
    weTaste = weTaste?.trim();
    process = process?.trim();

    try {
        const errorList = [];

        if (!name || !country || !weTaste || !process || !score) {
            errorList.push('All fields are required.');
        }

        const numericScore = Number(score);

        if (isNaN(numericScore) || !Number.isInteger(numericScore)) {
            errorList.push('Score must be an integer number.');
        }

        if (numericScore < 0 || numericScore > 100) {
            errorList.push('Score must be between 0 and 100.');
        }

        if (errorList.length > 0) {
            return res.status(400).json({ errors: errorList });
        }

        const newCoffee = new Coffee({
            name,
            country,
            weTaste,
            process,
            score,
            image_url: imageUrl
        });

        await newCoffee.save();

        return res.status(201).json({ message: 'Coffee added successfully!', coffee: newCoffee });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const getCoffees = async (req, res) => {
    try {
        const coffees = await Coffee.find();

        return res.status(200).json(coffees);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const editCoffeeInfo = async (req, res) => {
    const { _id } = req.params;
    const { name, country, weTaste, process, score } = req.body;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                error: 'Invalid ID format.',
                message: 'The provided coffee ID is not valid.'
            });
        }

        const coffee = await Coffee.findById(_id);
        if (!coffee) {
            return res.status(404).json({
                error: 'Not found.',
                message: `Coffee with ID ${_id} doesn't exist.`
            });
        }

        if (req.file) {
            coffee.image_url = `/uploads/coffee/${req.file.filename}`;
            console.log('New image path set:', coffee.image_url);
        }

        if (name) coffee.name = name.trim();
        if (country) coffee.country = country.trim();
        if (weTaste) coffee.weTaste = weTaste.trim();
        if (process) coffee.process = process.trim();

        if (score !== undefined) {
            const numericScore = Number(score);

            if (isNaN(numericScore) || !Number.isInteger(numericScore)) {
                return res.status(400).json({ error: 'Score must be an integer number.' });
            }

            if (numericScore < 0 || numericScore > 100) {
                return res.status(400).json({ error: 'Score must be between 0 and 100.' });
            }

            coffee.score = numericScore;
        }

        const updatedCoffee = await coffee.save();

        console.log('Uploaded file:', req.file);

        return res.status(200).json({
            success: true,
            message: 'Coffee updated successfully!',
            data: updatedCoffee
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const removeCoffee = async (req, res) => {
    const { _id } = req.params;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid coffee ID.' });
        }

        const coffee = await Coffee.findById(_id);

        if (!coffee) {
            return res.status(404).json({
                error: 'Coffee not found.',
                message: `Coffee with ID ${_id} was not found.`
            });
        }

        await Coffee.findByIdAndDelete(_id);

        return res.status(200).json({ message: `"${coffee._id}" deleted successfully!` });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


export {
    addCoffee,
    getCoffees,
    editCoffeeInfo,
    removeCoffee
};