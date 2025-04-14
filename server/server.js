import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import cors from 'cors';

// config
import createAdmin from './config/adminSetup.js';

// routes
import courseRoutes from './routes/courseRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import coffeeRoutes from './routes/coffeeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/coffees', coffeeRoutes);
app.use('/api/categories', categoryRoutes);

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


mongoose.connect(process.env.CONNECTION_STR)
    .then(async () => {
        console.log('Connected to db');

        try {
            await createAdmin();
            console.log('Admin account created successfully!');
        } catch (adminError) {
            console.error('Error creating admin account:', adminError);
        }

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}!`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to db:', err);
        process.exit(1);
    });