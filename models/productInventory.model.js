import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductInventory = sequelize.define('ProductInventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    color_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    tableName: 'product_inventory',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['product_id', 'color_id'] }],
});

export default ProductInventory;