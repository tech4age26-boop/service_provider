const cloudinary = require('cloudinary').v2;
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
            fullName, iqamaId, mobileNumber, password,
            services, offersOutdoorServices,
            latitude, longitude, address,
            logoUrl: bodyLogoUrl,
            frontPhotoUrl,
        } = req.body;

        // Validate required fields based on type
        if (!mobileNumber || !password || !type) {
            return res.status(400).json({
                success: false,
                message: 'Type, mobile number and password are required'
            });
        }

        let logoUrl = bodyLogoUrl || null;

        // Connect to Mongo inside the handler for Serverless consistency
        console.log('Connecting to MongoDB...');
        try {
            await client.connect();
        } catch (dbError) {
            console.error('MongoDB connection failed:', dbError);
            return res.status(503).json({
                success: false,
                message: 'Database connection failed. Please try again.'
            });
        }

        const db = client.db('filter');

        // Define collections
        const providersCollection = db.collection('register_workshop');
        const customersCollection = db.collection('customers');

        // Check if phone exists in ANY collection
        const existingInProviders = await providersCollection.findOne({ mobileNumber });
        const existingInCustomers = await customersCollection.findOne({ phone: mobileNumber });

        if (existingInProviders || existingInCustomers) {
            console.log('Registration failed: Phone already registered:', mobileNumber);
            return res.status(400).json({
                success: false,
                message: 'This mobile number is already registered'
            });
        }

        if (req.files && req.files['logo']) {
            console.log('Uploading logo to Cloudinary...');
            try {
                const result = await uploadToCloudinary(req.files['logo'][0].buffer);
                console.log('Logo uploaded:', result.secure_url);
                logoUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Logo upload failed:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Logo upload failed: ' + uploadError.message
                });
            }
        }

        let uploadedFrontPhotoUrl = frontPhotoUrl || null;
        if (req.files && req.files['frontPhoto']) {
            console.log('Uploading front photo to Cloudinary...');
            try {
                const result = await uploadToCloudinary(req.files['frontPhoto'][0].buffer);
                console.log('Front photo uploaded:', result.secure_url);
                uploadedFrontPhotoUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Front photo upload failed:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Front photo upload failed: ' + uploadError.message
                });
            }
        }

        const providerData = {
            type: type,
            services: services ? JSON.parse(services) : [],
            offersOutdoorServices: offersOutdoorServices === 'true',
            mobileNumber,
            frontPhotoUrl: uploadedFrontPhotoUrl,
            createdAt: new Date()
        };

        if (type === 'workshop') {
            providerData.workshopName = workshopName;
            providerData.ownerName = ownerName;
            providerData.crNumber = crNumber;
            providerData.vatNumber = vatNumber;
        } else {
            providerData.fullName = fullName;
            providerData.iqamaId = iqamaId;
        }

        // Shared location and address
        if (latitude && longitude) {
            providerData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }
        if (address) {
            providerData.address = address;
        }
        if (logoUrl) {
            providerData.logoUrl = logoUrl;
        }

        // Password hashing
        const salt = await bcrypt.genSalt(10);
        providerData.password = await bcrypt.hash(password, salt);

        // Insert into the correctly chosen collection
        console.log(`Inserting into register_workshop...`);
        const result = await providersCollection.insertOne(providerData);

        console.log('Provider registered successfully. ID:', result.insertedId);

        res.status(201).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} registered successfully`,
            providerId: result.insertedId,
            provider: {
                _id: result.insertedId,
                ...providerData
            }
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
        await client.connect();
        const db = client.db('filter');

        const providers = await db.collection('register_workshop').find({}).sort({ createdAt: -1 }).toArray();

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

module.exports = {
    registerProvider,
    getProviders
};