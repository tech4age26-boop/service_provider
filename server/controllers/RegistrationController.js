const cloudinary = require('cloudinary').v2;
const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connection is handled by Mongoose in index.js usually, 
// but we'll ensure it's established if needed or just use the model.

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'providers' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

const registerProvider = async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        console.log('Files received:', req.files ? Object.keys(req.files) : 'none');

        const {
            type, // 'workshop' or 'individual'
            workshopName, ownerName, crNumber, vatNumber,
            fullName, iqamaId, mobileNumber, password, email, drivingLicenseNumber,
            services, offersOutdoorServices,
            latitude, longitude, address,
        } = req.body;

        // Validate required fields based on type
        if (!mobileNumber || !password || !type) {
            return res.status(400).json({
                success: false,
                message: 'Type, mobile number and password are required'
            });
        }

        const providerData = {
            type,
            mobileNumber,
            email: email || null,
            services: services ? JSON.parse(services) : [],
            offersOutdoorServices: offersOutdoorServices === 'true' || offersOutdoorServices === 'yes',
            createdAt: new Date()
        };

        const fileFields = type === 'workshop'
            ? ['logo', 'frontPhoto', 'vatCertificate', 'crDocument']
            : ['logo', 'frontPhoto', 'iqamaIdAttach', 'drivingLicenseAttach'];

        if (req.files) {
            for (const field of fileFields) {
                if (req.files[field]) {
                    console.log(`Uploading ${field} to Cloudinary...`);
                    try {
                        const result = await uploadToCloudinary(req.files[field][0].buffer);
                        const urlFieldName = field === 'logo' ? 'logoUrl' : `${field}Url`;
                        providerData[urlFieldName] = result.secure_url;
                    } catch (uploadError) {
                        console.error(`${field} upload failed:`, uploadError);
                    }
                }
            }
        }

        if (type === 'workshop') {
            providerData.workshopName = workshopName;
            providerData.ownerName = ownerName;
            providerData.crNumber = crNumber;
            providerData.vatNumber = vatNumber;
        } else {
            providerData.fullName = fullName;
            providerData.iqamaId = iqamaId;
            providerData.drivingLicenseNumber = drivingLicenseNumber;
        }

        if (latitude && longitude) {
            providerData.location = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };
        }
        if (address) {
            providerData.address = address;
        }

        // Password hashing
        const salt = await bcrypt.genSalt(10);
        providerData.password = await bcrypt.hash(password, salt);

        // Check for existing provider
        const existingProvider = await Provider.findOne({ mobileNumber });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'This mobile number is already registered'
            });
        }

        const provider = new Provider(providerData);
        await provider.save();

        const returnUser = provider.toObject();
        delete returnUser.password;
        returnUser.id = provider._id;

        res.status(201).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} registered successfully`,
            providerId: provider._id,
            provider: { ...returnUser, id: provider._id }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: ' + error.message,
            error: error.message
        });
    }
};

const getProviders = async (req, res) => {
    try {
        const providers = await Provider.find({}).sort({ createdAt: -1 });

        // Combine and add type-specific naming
        const mappedProviders = providers.map(p => ({
            id: p._id,
            name: p.type === 'workshop' ? p.workshopName : p.fullName,
            ownerName: p.ownerName,
            type: p.type, // 'workshop' or 'individual'
            address: p.address,
            logoUrl: p.logoUrl,
            rating: p.rating || 0,
            createdAt: p.createdAt
        }));

        res.status(200).json({
            success: true,
            providers: mappedProviders
        });
    } catch (error) {
        console.error('Get Providers Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findById(id);

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        const returnUser = provider.toObject();
        delete returnUser.password;
        returnUser.id = provider._id;

        res.status(200).json({
            success: true,
            provider: returnUser
        });
    } catch (error) {
        console.error('Get Provider Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Update request for provider ${id}:`, req.body);

        const updateData = { ...req.body };
        delete updateData.id;
        delete updateData._id;
        delete updateData.password; // Don't update password here

        // Handle File Uploads
        if (req.files) {
            const fileFields = [
                'logo',
                'frontPhoto',
                'vatCertificate',
                'crDocument',
                'iqamaIdAttach',
                'drivingLicenseAttach'
            ];

            for (const field of fileFields) {
                if (req.files[field]) {
                    console.log(`Uploading ${field} to Cloudinary...`);
                    try {
                        const result = await uploadToCloudinary(req.files[field][0].buffer);
                        // Map field names to URL names
                        const urlFieldName = field === 'logo' ? 'logoUrl' : `${field}Url`;
                        updateData[urlFieldName] = result.secure_url;
                    } catch (error) {
                        console.error(`Error uploading ${field}:`, error);
                    }
                }
            }
        }

        const provider = await Provider.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        const returnUser = provider.toObject();
        delete returnUser.password;
        returnUser.id = provider._id;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: returnUser
        });
    } catch (error) {
        console.error('Update Provider Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerProvider,
    getProviders,
    getProvider,
    updateProvider
};