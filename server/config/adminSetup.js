import Admin from '../models/adminModel.js';
import bcrypt from 'bcrypt';

const createAdmin = async () => {
    const count = await Admin.countDocuments();

    if (count === 0) {
        const hashedPassword = await bcrypt.hash('roast_admin_123', 10);
        await Admin.create({ username: 'roast_manager', password: hashedPassword });
    }
};

export default createAdmin;