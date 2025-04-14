import mongoose from 'mongoose';

// create a course schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    abbreviation: { type: String, required: true, maxlength: 200 },
    subtitle: { type: String, default: '' },
    overview: { type: String, required: true },
    objectives: { type: [String], required: true },
    topics: [
        {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                validator: function (v) {
                    return typeof v === "string" ||
                        (typeof v === "object" && v !== null && "title" in v && "subtopics" in v && Array.isArray(v.subtopics));
                },
                message: "Each topic must be either a string or an object with 'title' and 'subtopics'."
            }
        }
    ],
    structure: { type: [String], required: true },
    target_audience: { type: [String], required: true },
    customizable: { type: Boolean, default: false }
});


// create a course model for schema
const Course = new mongoose.model('Course', courseSchema);

export default Course;