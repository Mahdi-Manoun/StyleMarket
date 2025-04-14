import express from 'express';
import {
    addCourse,
    editCourseInfo,
    getCourses,
    removeCourse
} from '../controllers/courseController.js';

// middlewares
// import isAdmin from '../middlewares/isAdmin.js';
import require_course_fields from '../middlewares/require_course_fields.js';


const router = express.Router();

router.post('/', require_course_fields, addCourse);

router.get('/', getCourses);

router.patch('/:_id', editCourseInfo);

router.delete('/:_id', removeCourse);

export default router;