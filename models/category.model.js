import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.ENUM(
            'Special prices',
            'Cotton overalls and sets (0-24 months)',
            'Wool Fleece and velvet overalls (0-24 months)',
            'Baby boy (6 - 36 months)',
            'Baby girls (6-36 months)',
            'Boys (4-16 years)',
            'Girls (4-16 years)',
            'Blankets',
            'Bath towels',
            'Cotton Underwears',
            'Bibs',
            'Baby shoes',
            'Socks and tights',
            'Baby gadgets toys',
            'Others'
        ),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'categories',
    timestamps: false,
    underscored: true,
});

export default Category;