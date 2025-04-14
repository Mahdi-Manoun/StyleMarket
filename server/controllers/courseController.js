import mongoose from 'mongoose';
import Course from '../models/courseModel.js';

// add a course
const addCourse = async (req, res) => {
    let { title, subtitle, abbreviation, overview, objectives, topics, structure, target_audience, customizable } = req.body;
    subtitle = subtitle?.trim();

    try {
        const course = await Course.create({ title, subtitle, abbreviation, overview, objectives, topics, structure, target_audience, customizable });
        return res.status(201).json({ message: 'Course added successfully!', course });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();

        return res.status(200).json(courses);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

const editCourseInfo = async (req, res) => {
    const { _id } = req.params;
    let { title, subtitle, abbreviation, overview, objectives, topics, structure, target_audience, customizable } = req.body;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid course ID.' });
        }

        const course = await Course.findById(_id);

        if (!course) {
            return res.status(404).json({
                error: 'Course not found',
                message: `Course with ID ${_id} was not found.`
            });
        }

        let invalidFields = [];
        if (objectives && !Array.isArray(objectives)) invalidFields.push('Objectives');
        if (structure && !Array.isArray(structure)) invalidFields.push('structure');
        if (target_audience && !Array.isArray(target_audience)) invalidFields.push('target_audience');

        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `"${invalidFields.join(', ')}" must be an array.` });
        }

        if (customizable !== undefined && typeof customizable !== 'boolean') {
            return res.status(400).json({ message: 'Customizable must be a boolean value.' });
        }

        course.title = title?.trim() || course.title;
        course.subtitle = subtitle?.trim() || course.subtitle;
        course.abbreviation = abbreviation?.trim() || course.abbreviation;
        course.overview = overview?.trim() || course.overview;
        course.objectives = objectives || course.objectives;
        course.topics = topics || course.topics;
        course.structure = structure || course.structure;
        course.target_audience = target_audience || course.target_audience;
        course.customizable = customizable ?? course.customizable;

        await course.save();

        return res.status(200).json({
            message: `Course with ID ${_id} updated successfully!`,
            course
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

const removeCourse = async (req, res) => {
    const { _id } = req.params;

    try {
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid course ID.' });
        }

        const course = await Course.findById(_id);

        if (!course) {
            return res.status(404).json({
                error: 'Course not found',
                message: `Course with ID ${_id} was not found.`
            });
        }

        await Course.findByIdAndDelete(_id);

        return res.status(200).json({ message: `"${course._id}" deleted successfully!` });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export {
    addCourse,
    getCourses,
    editCourseInfo,
    removeCourse
};