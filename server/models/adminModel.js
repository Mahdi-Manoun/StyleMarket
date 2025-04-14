import mongoose from 'mongoose';

// create a admin schema
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// create a admin model for schema
const Admin = new mongoose.model('Admin', adminSchema);

export default Admin;