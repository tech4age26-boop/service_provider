const cloudinary = require('cloudinary').v2;
const { MongoClient, ObjectId } = require('mongodb');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products_services' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

const getCollection = async () => {
    await client.connect();
    const db = client.db('filter');
    return db.collection('product_services');
};

/* =========================
   CREATE Product / Service
========================= */
const createItem = async (req, res) => {
    try {
        const {
            providerId, name, price, category,
            subCategory, stock, sku,
            duration, serviceTypes, status,
            uom, purchasePrice, taxPercentage
        } = req.body;

        if (!providerId || !name || !price || !['service', 'product'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid input data' });
        }

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer))
            );
            imageUrls = uploads.map(u => u.secure_url);
        }

        const item = {
            id: new ObjectId().toString(),
            providerId,
            name,
            price: parseFloat(price),
            category,
            subCategory: subCategory || null,
            stock: category === 'product' ? parseInt(stock || 0) : null,
            sku: sku || null,
            uom: category === 'product' ? uom : null,
            purchasePrice: category === 'product' ? parseFloat(purchasePrice || 0) : null,
            duration: category === 'service' ? parseInt(duration || 0) : null,
            serviceTypes:
                category === 'service'
                    ? (typeof serviceTypes === 'string' ? JSON.parse(serviceTypes) : serviceTypes || [])
                    : [],
            status: status || 'active',
            images: imageUrls,
            taxPercentage: parseFloat(taxPercentage || 0),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await client.connect();
        const db = client.db('filter');
        const providersCollection = db.collection('register_workshop');

        // Check if provider is an individual technician
        // Find provider to get its logo and specific technician info if available
        let provider = null;
        if (ObjectId.isValid(providerId)) {
            provider = await providersCollection.findOne({ _id: new ObjectId(providerId) });
        }

        if (provider && provider.type === 'individual' && category === 'service') {
            console.log('Stashing service into individual provider document...');
            await providersCollection.updateOne(
                { _id: new ObjectId(providerId) },
                { $push: { services: item } }
            );

            return res.status(201).json({
                success: true,
                message: 'Service added to technician profile',
                item: item
            });
        }

        // Default behavior: store in product_services collection
        const collection = db.collection('product_services');
        const result = await collection.insertOne(item);

        res.status(201).json({
            success: true,
            item: { _id: result.insertedId, ...item }
        });

    } catch (error) {
        console.error('Create Item Error:', error);
        res.status(500).json({ success: false, message: 'Create failed', error: error.message });
    }
};

/* =========================
   READ Items by Provider
========================= */
const getItems = async (req, res) => {
    try {
        const { providerId } = req.query;

        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        await client.connect();
        const db = client.db('filter');
        const providersCollection = db.collection('register_workshop');
        const itemsCollection = db.collection('product_services');

        // 1. Get from standalone collection
        const standaloneItems = await itemsCollection
            .find({ providerId })
            .sort({ createdAt: -1 })
            .toArray();

        // 2. Get from provider's own document (if individual)
        let providerItems = [];
        if (ObjectId.isValid(providerId)) {
            const provider = await providersCollection.findOne({ _id: new ObjectId(providerId) });
            if (provider && provider.services) {
                providerItems = provider.services;
            }
        }

        // Combine both
        const allItems = [...standaloneItems, ...providerItems];

        res.status(200).json({ success: true, items: allItems });

    } catch (error) {
        console.error('Get Items Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/* =========================
   UPDATE Item
========================= */
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        delete updates._id;

        await client.connect();
        const db = client.db('filter');
        const itemsCollection = db.collection('product_services');
        const providersCollection = db.collection('register_workshop');

        if (updates.price) updates.price = parseFloat(updates.price);
        if (updates.purchasePrice) updates.purchasePrice = parseFloat(updates.purchasePrice);
        if (updates.stock) updates.stock = parseInt(updates.stock);
        if (updates.duration) updates.duration = parseInt(updates.duration);
        if (updates.taxPercentage) updates.taxPercentage = parseFloat(updates.taxPercentage);

        if (updates.serviceTypes && typeof updates.serviceTypes === 'string') {
            updates.serviceTypes = JSON.parse(updates.serviceTypes);
        }

        if (updates.existingImages) {
            updates.images = JSON.parse(updates.existingImages);
            delete updates.existingImages;
        }

        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer))
            );
            const newImages = uploads.map(u => u.secure_url);
            updates.images = [...(updates.images || []), ...newImages];
        }

        updates.updatedAt = new Date();

        // 1. Try updating standalone collection
        if (ObjectId.isValid(id)) {
            const result = await itemsCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updates },
                { returnDocument: 'after' }
            );
            if (result) {
                return res.status(200).json({ success: true, item: result });
            }
        }

        // 2. Try updating inside individual provider's services array
        const technician = await providersCollection.findOne({ "services.id": id });
        if (technician) {
            // Find the service to merge existing data (like original created date)
            const oldService = technician.services.find(s => s.id === id);
            const mergedService = { ...oldService, ...updates };

            const updateRes = await providersCollection.updateOne(
                { _id: technician._id, "services.id": id },
                { $set: { "services.$": mergedService } }
            );

            if (updateRes.modifiedCount > 0) {
                return res.status(200).json({ success: true, item: mergedService });
            }
        }

        res.status(404).json({ success: false, message: 'Item not found' });

    } catch (error) {
        console.error('Update Item Error:', error);
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

/* =========================
   DELETE Item
========================= */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'ID required' });
        }

        await client.connect();
        const db = client.db('filter');

        // 1. Try deleting from product_services (for workshops)
        const itemsCollection = db.collection('product_services');
        let result = null;
        if (ObjectId.isValid(id)) {
            result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });
        }

        if (result && result.deletedCount > 0) {
            return res.status(200).json({ success: true, message: 'Item deleted from product_services' });
        }

        // 2. Try deleting from register_workshop services array (for individuals)
        const providersCollection = db.collection('register_workshop');
        const updateResult = await providersCollection.updateMany(
            { "services.id": id },
            { $pull: { services: { id: id } } }
        );

        if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ success: true, message: 'Service removed from technician profile' });
        }

        // If not found in either
        res.status(404).json({ success: false, message: 'Item not found in any collection' });

    } catch (error) {
        console.error('Delete Item Error:', error);
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};

const getServices = async (req, res) => {
    try {
        const { providerId } = req.query;
        await client.connect();
        const db = client.db('filter');
        const items = await db.collection('product_services').find({
            providerId,
            category: 'service'
        }).toArray();
        res.json({ success: true, data: items });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

module.exports = {
    createItem,
    getItems,
    getServices,
    updateItem,
    deleteItem
};
