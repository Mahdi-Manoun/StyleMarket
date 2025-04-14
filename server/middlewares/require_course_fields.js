const require_course_fields = (req, res, next) => {
    let { title, abbreviation, overview, objectives, topics, structure, target_audience, customizable } = req.body;

    try {
        title = title?.trim();
        abbreviation = abbreviation?.trim();
        overview = overview?.trim();

        let emptyFields = [];

        if (!title) emptyFields.push('title');
        if (!abbreviation) emptyFields.push('abbreviation');
        if (!overview) emptyFields.push('overview');

        if (!Array.isArray(objectives) || objectives.length === 0) emptyFields.push('objectives');
        if (!Array.isArray(structure) || structure.length === 0) emptyFields.push('structure');
        if (!Array.isArray(target_audience) || target_audience.length === 0) emptyFields.push('target_audience');

        if (customizable && typeof customizable !== 'boolean') emptyFields.push('customizable');


        if (emptyFields.length > 0) {
            return res.status(400).json({ error: `Fields "${emptyFields.join(', ')}" should not be empty or invalid.` });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export default require_course_fields;