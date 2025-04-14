import multer from 'multer';
import path from 'path';

const storage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const uploadWorkshop = multer({ storage: storage('workshop') });
export const uploadCoffee = multer({ storage: storage('coffee') });