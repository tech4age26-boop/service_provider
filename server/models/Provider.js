const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['workshop', 'individual'],
        required: true
    },

    // Workshop specific fields
    workshopName: String,
    ownerName: String,
    crNumber: String,
    vatNumber: String,
    location: {
        latitude: Number,
        longitude: Number
    },
    address: String,
    logoUrl: String,
    frontPhotoUrl: String,
    vatCertificateUrl: String,
    crDocumentUrl: String,

    // Individual specific fields
    fullName: String,
    iqamaId: String,
    drivingLicenseNumber: String,
    iqamaIdAttachUrl: String,
    drivingLicenseAttachUrl: String,
    mobileNumber: String,
    email: String,
    password: String,

    // Common fields
    services: [String],
    offersOutdoorServices: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Provider', ProviderSchema, 'register_workshop');
