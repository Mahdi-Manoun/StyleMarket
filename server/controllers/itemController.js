import Item from '../models/itemModel.js';

const addItem = async (req, res) => {
    let { category_id, title, description, additional_info, image_url } = req.body;

    category_id = category_id?.trim();
    title = title?.trim();
    description = description?.trim();
    try {
        let emptyFields = [];
        if (!category_id) emptyFields.push('category_id');
        if (!title) emptyFields.push('title');
        if (emptyFields.length > 0) {
            return res.status(400).json({ error: `Fields "${emptyFields.join(', ')}" should not be empty or invalid.` });
        }

        const item = await Item.create({ category_id, title, description, additional_info, image_url });

        return res.status(201).json({ message: 'Item added successfully!', item });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
}


export { addItem };