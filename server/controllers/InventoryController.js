const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const getCollection = async () => {
    await client.connect();
    const db = client.db('filter');
    return db.collection('inventory');
};

const addInventory = async (req, res) => {
    try {
        const { providerId, name, purchasePrice, sellingPrice, stock, sku, category, serviceId, unitOfMeasurement, taxPercentage } = req.body;

        if (!providerId || !name || !purchasePrice || !sellingPrice || !stock) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const collection = await getCollection();
        const newItem = {
            providerId,
            name,
            purchasePrice: parseFloat(purchasePrice),
            sellingPrice: parseFloat(sellingPrice),
            stock: parseInt(stock),
            sku: sku || '',
            category: category || 'General',
            serviceId: serviceId || '',
            unitOfMeasurement: unitOfMeasurement || 'Unit',
            taxPercentage: taxPercentage !== undefined && taxPercentage !== '' ? parseFloat(taxPercentage) : 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(newItem);
        res.status(201).json({ success: true, item: { ...newItem, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Inventory Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add inventory' });
    }
};

const getInventory = async (req, res) => {
    try {
        const { providerId, serviceId, category, page = 1, limit = 20 } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        const query = { providerId };
        if (serviceId) query.serviceId = serviceId;
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitVal = parseInt(limit);

        const collection = await getCollection();

        const total = await collection.countDocuments(query);
        const items = await collection.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitVal)
            .toArray();

        res.status(200).json({
            success: true,
            items,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitVal,
                hasMore: (skip + items.length) < total
            }
        });
    } catch (error) {
        console.error('Get Inventory Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates._id;

        if (updates.purchasePrice) updates.purchasePrice = parseFloat(updates.purchasePrice);
        if (updates.sellingPrice) updates.sellingPrice = parseFloat(updates.sellingPrice);
        if (updates.stock) updates.stock = parseInt(updates.stock);
        if (updates.taxPercentage !== undefined && updates.taxPercentage !== '') updates.taxPercentage = parseFloat(updates.taxPercentage);
        updates.updatedAt = new Date();

        const collection = await getCollection();
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, item: result });
    } catch (error) {
        console.error('Update Inventory Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update inventory' });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, message: 'Item deleted' });
    } catch (error) {
        console.error('Delete Inventory Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete inventory' });
    }
};

// --- Category Management ---

const addCategory = async (req, res) => {
    try {
        const { providerId, name, type } = req.body;
        if (!providerId || !name) {
            return res.status(400).json({ success: false, message: 'Provider ID and category name are required' });
        }

        const categoryType = type || 'product'; // Default to product for backward compatibility

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('inventory_categories');

        const newCategory = {
            providerId,
            name,
            type: categoryType,
            departmentId: req.body.departmentId || null,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newCategory);
        res.status(201).json({ success: true, category: { ...newCategory, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Category Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add category' });
    }
};

const getCategories = async (req, res) => {
    try {
        const { providerId, type } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('inventory_categories');

        const query = { providerId };
        if (type) query.type = type;

        const categories = await collection.find(query).toArray();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('inventory_categories');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Category not found' });

        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
};

module.exports = {
    addInventory,
    getInventory,
    updateInventory,
    deleteInventory,
    addCategory,
    getCategories,
    deleteCategory
};
