const mongoose = require('mongoose');

const ProductServiceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['service', 'product'],
        required: true
    },
    // Product specific fields
    subCategory: String,
    stock: Number,
    sku: String,
    uom: String,
    purchasePrice: Number,

    // Service specific fields
    duration: Number, // in minutes
    serviceTypes: [String],

    // Common fields
    images: [String],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ProductService', ProductServiceSchema);
